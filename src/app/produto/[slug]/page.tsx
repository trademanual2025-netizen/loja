import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSettings, SETTINGS_KEYS } from '@/lib/config'
import { getAuthUser } from '@/lib/auth'
import { StoreHeader } from '@/components/store/StoreHeader'
import { StoreFooter } from '@/components/store/StoreFooter'
import { ProductPageClient } from '@/components/store/ProductPageClient'
import { cookies } from 'next/headers'
import { dictionaries, Locale, defaultLocale, translateDb } from '@/lib/i18n'

export const revalidate = 30

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
                slug: true,
                description: true,
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

    return (
        <>
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
            <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 16px 60px' }}>
                <ProductPageClient
                    product={{
                        id: product.id,
                        name: translateDb(product.name, currentLocale),
                        slug: product.slug,
                        description: product.description ? translateDb(product.description, currentLocale) : null,
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
                        name: translateDb(rp.name, currentLocale),
                        slug: rp.slug,
                        price: rp.price,
                        comparePrice: rp.comparePrice,
                        image: rp.images[0] || '',
                    }))}
                />
            </main>
            <StoreFooter storeName={storeName} dict={dict} footerText={storeSettings[SETTINGS_KEYS.STORE_FOOTER_TEXT] || undefined} />
        </>
    )
}
