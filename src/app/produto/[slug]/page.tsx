import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSettings, SETTINGS_KEYS } from '@/lib/config'
import { getAuthUser } from '@/lib/auth'
import { StoreHeader } from '@/components/store/StoreHeader'
import { StoreFooter } from '@/components/store/StoreFooter'
import { ProductPageClient } from '@/components/store/ProductPageClient'
import { cookies } from 'next/headers'
import { dictionaries, Locale, defaultLocale, translateDb } from '@/lib/i18n'
import type { Metadata } from 'next'

export const revalidate = 30

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const product = await prisma.product.findUnique({
        where: { slug },
        select: { name: true, nameEn: true, nameEs: true, description: true, descriptionEn: true, descriptionEs: true, price: true, images: true, active: true },
    })
    if (!product || !product.active) {
        return { title: 'Produto não encontrado — Giovana Dias Joias' }
    }

    const cookieStore = await cookies()
    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale
    const currentLocale = (localeCookie && dictionaries[localeCookie]) ? localeCookie : defaultLocale

    const name = currentLocale === 'en' ? (product.nameEn || product.name) : currentLocale === 'es' ? (product.nameEs || product.name) : product.name
    const desc = currentLocale === 'en' ? (product.descriptionEn || product.description) : currentLocale === 'es' ? (product.descriptionEs || product.description) : product.description
    const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))
    const title = `${name} — ${priceFormatted}`
    const plainDesc = desc ? desc.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim() : ''
    const description = plainDesc ? plainDesc.substring(0, 160) : `${name} — Joia artesanal exclusiva por Giovana Dias.`
    const image = product.images[0] || undefined
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://giovanadiasjewelry.com.br'

    return {
        title,
        description,
        alternates: {
            canonical: `${baseUrl}/produto/${slug}`,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: `${baseUrl}/produto/${slug}`,
            ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: name }] } : {}),
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            ...(image ? { images: [image] } : {}),
        },
    }
}

export async function generateStaticParams() {
    const products = await prisma.product.findMany({
        where: { active: true },
        select: { slug: true },
        take: 100,
    })
    return products.map((p) => ({ slug: p.slug }))
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    const [product, storeSettings, user, cookieStore] = await Promise.all([
        prisma.product.findUnique({
            where: { slug },
            select: {
                id: true,
                name: true,
                nameEn: true,
                nameEs: true,
                slug: true,
                description: true,
                descriptionEn: true,
                descriptionEs: true,
                price: true,
                comparePrice: true,
                images: true,
                stock: true,
                active: true,
                bannerUrl: true,
                categoryId: true,
                options: { select: { name: true, values: true } },
                variants: { select: { id: true, name: true, price: true, stock: true, sku: true, image: true } },
            },
        }),
        getSettings([SETTINGS_KEYS.STORE_NAME, SETTINGS_KEYS.STORE_LOGO, SETTINGS_KEYS.STORE_INSTALLMENTS, SETTINGS_KEYS.STORE_INSTALLMENTS_MIN_VALUE, SETTINGS_KEYS.STORE_FOOTER_TEXT]),
        getAuthUser(),
        cookies()
    ])

    if (!product || !product.active) notFound()

    const relatedProducts = await prisma.product.findMany({
        where: {
            active: true,
            id: { not: product.id },
            ...(product.categoryId ? { categoryId: product.categoryId } : {}),
        },
        select: {
            id: true,
            name: true,
            nameEn: true,
            nameEs: true,
            slug: true,
            price: true,
            comparePrice: true,
            images: true,
        },
        take: product.categoryId ? 8 : 8,
        orderBy: { createdAt: 'desc' },
    })

    const storeName = storeSettings[SETTINGS_KEYS.STORE_NAME] || 'Loja Virtual'
    const logoUrl = storeSettings[SETTINGS_KEYS.STORE_LOGO] || undefined

    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale
    const currentLocale = (localeCookie && dictionaries[localeCookie]) ? localeCookie : defaultLocale
    const dict = dictionaries[currentLocale]

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://giovanadiasjewelry.com.br')
    const productName = currentLocale === 'en' ? (product.nameEn || product.name) : currentLocale === 'es' ? (product.nameEs || product.name) : product.name
    const productDescription = currentLocale === 'en' ? (product.descriptionEn || product.description || '') : currentLocale === 'es' ? (product.descriptionEs || product.description || '') : (product.description || '')

    const productUrl = `${baseUrl}/produto/${product.slug}`
    const hasVariants = product.variants && product.variants.length > 0
    const inStock = hasVariants
        ? product.variants.some(v => v.stock > 0)
        : product.stock > 0

    const variantOffers = hasVariants
        ? product.variants.map(v => ({
            '@type': 'Offer',
            name: v.name,
            url: productUrl,
            priceCurrency: 'BRL',
            price: Number(v.price || product.price).toFixed(2),
            availability: v.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: { '@type': 'Organization', name: storeName },
        }))
        : null

    const productJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': productUrl,
        name: productName,
        description: productDescription.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().substring(0, 500),
        image: product.images.length > 0 ? product.images : undefined,
        sku: product.slug,
        brand: {
            '@type': 'Brand',
            name: storeName,
        },
        offers: hasVariants && variantOffers ? {
            '@type': 'AggregateOffer',
            url: productUrl,
            priceCurrency: 'BRL',
            lowPrice: Math.min(...product.variants.map(v => Number(v.price || product.price))).toFixed(2),
            highPrice: Math.max(...product.variants.map(v => Number(v.price || product.price))).toFixed(2),
            offerCount: product.variants.length,
            availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            offers: variantOffers,
        } : {
            '@type': 'Offer',
            url: productUrl,
            priceCurrency: 'BRL',
            price: Number(product.price).toFixed(2),
            availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: { '@type': 'Organization', name: storeName },
        },
    }

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: dict.nav.home,
                item: baseUrl,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: dict.nav.store,
                item: `${baseUrl}/loja`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: productName,
                item: `${baseUrl}/produto/${product.slug}`,
            },
        ],
    }

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <StoreHeader storeName={storeName} logoUrl={logoUrl} user={user} dict={dict} />
            {product.bannerUrl && (
                <div style={{ width: '100%', maxHeight: 'clamp(200px, 40vw, 400px)', overflow: 'hidden', position: 'relative' }}>
                    <img
                        src={product.bannerUrl}
                        alt={`Banner ${product.name}`}
                        style={{ width: '100%', height: 'clamp(200px, 40vw, 400px)', objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, var(--bg) 100%)' }} />
                </div>
            )}
            <main style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(20px, 4vw, 40px) clamp(12px, 3vw, 16px) clamp(30px, 5vw, 60px)' }}>
                <ProductPageClient
                    product={{
                        id: product.id,
                        name: currentLocale === 'en' ? (product.nameEn || product.name) : currentLocale === 'es' ? (product.nameEs || product.name) : product.name,
                        slug: product.slug,
                        description: currentLocale === 'en' ? (product.descriptionEn || product.description || null) : currentLocale === 'es' ? (product.descriptionEs || product.description || null) : (product.description || null),
                        price: product.price,
                        comparePrice: product.comparePrice,
                        images: product.images,
                        stock: product.stock,
                        options: product.options,
                        variants: product.variants,
                    }}
                    dict={dict.product}
                    installments={parseInt(storeSettings[SETTINGS_KEYS.STORE_INSTALLMENTS] || '0')}
                    installmentsMinValue={parseFloat(storeSettings[SETTINGS_KEYS.STORE_INSTALLMENTS_MIN_VALUE] || '0')}
                    relatedProducts={relatedProducts.map(rp => ({
                        id: rp.id,
                        name: currentLocale === 'en' ? (rp.nameEn || rp.name) : currentLocale === 'es' ? (rp.nameEs || rp.name) : rp.name,
                        slug: rp.slug,
                        price: rp.price,
                        comparePrice: rp.comparePrice,
                        image: rp.images[0] || '',
                    }))}
                />
            </main>
            <StoreFooter storeName={storeName} dict={dict} footerText={storeSettings[SETTINGS_KEYS.STORE_FOOTER_TEXT] || undefined} logoUrl={logoUrl} />
        </>
    )
}
