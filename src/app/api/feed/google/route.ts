import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600

function esc(str: string) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim()
}

function googleCategory(categoryName?: string | null): string {
    if (!categoryName) return 'Apparel &amp; Accessories &gt; Jewelry'
    const n = categoryName.toLowerCase()
    if (n.includes('anel') || n.includes('ring')) return 'Apparel &amp; Accessories &gt; Jewelry &gt; Rings'
    if (n.includes('brinco') || n.includes('earring')) return 'Apparel &amp; Accessories &gt; Jewelry &gt; Earrings'
    if (n.includes('colar') || n.includes('choker') || n.includes('necklace')) return 'Apparel &amp; Accessories &gt; Jewelry &gt; Necklaces'
    if (n.includes('pulseira') || n.includes('bracelet')) return 'Apparel &amp; Accessories &gt; Jewelry &gt; Bracelets'
    return 'Apparel &amp; Accessories &gt; Jewelry'
}

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://giovanadiasjewelry.com.br'

    const [products, settingsArr] = await Promise.all([
        prisma.product.findMany({
            where: { active: true },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                price: true,
                comparePrice: true,
                images: true,
                stock: true,
                category: { select: { name: true } },
                variants: {
                    select: { id: true, name: true, price: true, stock: true, sku: true, image: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.settings.findMany({ where: { key: { in: ['store_name', 'store_logo'] } } }),
    ])

    const settings: Record<string, string> = {}
    for (const s of settingsArr) settings[s.key] = s.value
    const storeName = settings['store_name'] || 'Giovana Dias Joias'

    const items: string[] = []

    for (const product of products) {
        const link = `${baseUrl}/produto/${product.slug}`
        const firstImage = product.images[0] || ''
        if (!firstImage) continue

        const desc = esc(stripHtml(product.description || product.name).substring(0, 5000))
        const additionalImages = product.images
            .slice(1, 10)
            .map(img => `      <g:additional_image_link>${img}</g:additional_image_link>`)
            .join('\n')
        const catName = product.category?.name
        const gCat = googleCategory(catName)

        if (product.variants && product.variants.length > 0) {
            for (const variant of product.variants) {
                const variantPrice = Number(variant.price || product.price)
                const compareP = product.comparePrice ? Number(product.comparePrice) : null
                const isOnSale = compareP && compareP > variantPrice
                const displayPrice = isOnSale ? compareP!.toFixed(2) : variantPrice.toFixed(2)
                const salePrice = isOnSale ? variantPrice.toFixed(2) : null
                const variantImage = variant.image || firstImage

                items.push(`    <item>
      <g:id>${product.slug}-${variant.id}</g:id>
      <g:item_group_id>${product.slug}</g:item_group_id>
      <g:title>${esc(product.name)} — ${esc(variant.name)}</g:title>
      <g:description>${desc}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${variantImage}</g:image_link>
${additionalImages}
      <g:availability>${variant.stock > 0 ? 'in stock' : 'out of stock'}</g:availability>
      <g:price>${displayPrice} BRL</g:price>
${salePrice ? `      <g:sale_price>${salePrice} BRL</g:sale_price>` : ''}
      <g:condition>new</g:condition>
      <g:brand>${esc(storeName)}</g:brand>
      <g:google_product_category>${gCat}</g:google_product_category>
      <g:size>${esc(variant.name)}</g:size>
${variant.sku ? `      <g:mpn>${esc(variant.sku)}</g:mpn>` : ''}
    </item>`)
            }
        } else {
            const price = Number(product.price)
            const compareP = product.comparePrice ? Number(product.comparePrice) : null
            const isOnSale = compareP && compareP > price
            const displayPrice = isOnSale ? compareP!.toFixed(2) : price.toFixed(2)
            const salePrice = isOnSale ? price.toFixed(2) : null
            const availability = product.stock > 0 ? 'in stock' : 'out of stock'

            items.push(`    <item>
      <g:id>${product.slug}</g:id>
      <g:title>${esc(product.name)}</g:title>
      <g:description>${desc}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${firstImage}</g:image_link>
${additionalImages}
      <g:availability>${availability}</g:availability>
      <g:price>${displayPrice} BRL</g:price>
${salePrice ? `      <g:sale_price>${salePrice} BRL</g:sale_price>` : ''}
      <g:condition>new</g:condition>
      <g:brand>${esc(storeName)}</g:brand>
      <g:google_product_category>${gCat}</g:google_product_category>
    </item>`)
        }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(storeName)}</title>
    <link>${baseUrl}</link>
    <description>Catálogo de produtos — ${esc(storeName)}</description>
${items.join('\n')}
  </channel>
</rss>`

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
    })
}
