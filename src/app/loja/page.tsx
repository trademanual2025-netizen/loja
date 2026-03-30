import { prisma } from '@/lib/prisma'
import { getSettings, SETTINGS_KEYS } from '@/lib/config'
import { getAuthUser } from '@/lib/auth'
import { StoreHeader } from '@/components/store/StoreHeader'
import { ProductFilter } from '@/components/store/ProductFilter'
import { StoreFooter } from '@/components/store/StoreFooter'
import { cookies } from 'next/headers'
import { dictionaries, defaultLocale, Locale } from '@/lib/i18n'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies()
    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale
    const currentLocale = (localeCookie && dictionaries[localeCookie]) ? localeCookie : defaultLocale

    const titles: Record<Locale, string> = {
        pt: 'Loja — Joias Artesanais Exclusivas',
        en: 'Store — Exclusive Handcrafted Jewelry',
        es: 'Tienda — Joyas Artesanales Exclusivas',
    }
    const descriptions: Record<Locale, string> = {
        pt: 'Explore nossa coleção exclusiva de joias artesanais feitas à mão por Giovana Dias.',
        en: 'Explore our exclusive collection of handcrafted jewelry by Giovana Dias.',
        es: 'Explora nuestra colección exclusiva de joyas artesanales hechas a mano por Giovana Dias.',
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://giovanadiasjewelry.com.br'

    return {
        title: titles[currentLocale],
        description: descriptions[currentLocale],
        alternates: { canonical: `${baseUrl}/loja` },
        openGraph: {
            title: titles[currentLocale],
            description: descriptions[currentLocale],
            type: 'website',
            url: `${baseUrl}/loja`,
        },
        twitter: {
            card: 'summary_large_image',
            title: titles[currentLocale],
            description: descriptions[currentLocale],
        },
    }
}

export const revalidate = 60

async function getProducts(search?: string, category?: string, limit = 24) {
  const where: Record<string, unknown> = { active: true }
  if (category) where.category = { slug: category }
  if (search) where.OR = [
    { name: { contains: search, mode: 'insensitive' } },
    { nameEn: { contains: search, mode: 'insensitive' } },
    { nameEs: { contains: search, mode: 'insensitive' } },
  ]
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        nameEn: true,
        nameEs: true,
        slug: true,
        price: true,
        comparePrice: true,
        images: true,
        stock: true,
        variants: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.product.count({ where }),
  ])
  const slimProducts = products.map(p => ({
    ...p,
    images: p.images.length > 0 ? [p.images[0]] : [],
  }))
  return { products: slimProducts, total, pages: Math.ceil(total / limit) }
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: { where: { active: true } } } } },
  })
  return categories.filter(c => c._count.products > 0)
}

export default async function LojaPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>
}) {
  const params = await searchParams

  const [storeSettings, categories, user, cookieStore] = await Promise.all([
    getSettings([
      SETTINGS_KEYS.STORE_NAME,
      SETTINGS_KEYS.STORE_LOGO,
      SETTINGS_KEYS.STORE_BANNER_URL,
      SETTINGS_KEYS.STORE_BANNER_TITLE,
      SETTINGS_KEYS.STORE_BANNER_TITLE_EN,
      SETTINGS_KEYS.STORE_BANNER_TITLE_ES,
      SETTINGS_KEYS.STORE_BANNER_SUBTITLE,
      SETTINGS_KEYS.STORE_BANNER_SUBTITLE_EN,
      SETTINGS_KEYS.STORE_BANNER_SUBTITLE_ES,
      SETTINGS_KEYS.STORE_PRODUCTS_PER_PAGE,
      SETTINGS_KEYS.STORE_INSTALLMENTS,
      SETTINGS_KEYS.STORE_INSTALLMENTS_MIN_VALUE,
      SETTINGS_KEYS.STORE_FOOTER_TEXT,
    ]),
    getCategories(),
    getAuthUser(),
    cookies(),
  ])

  const perPage = parseInt(storeSettings[SETTINGS_KEYS.STORE_PRODUCTS_PER_PAGE] || '24')
  const productsData = await getProducts(params.search, params.category, perPage)

  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale
  const currentLocale = (localeCookie && dictionaries[localeCookie]) ? localeCookie : defaultLocale
  const dict = dictionaries[currentLocale]

  const storeName = storeSettings[SETTINGS_KEYS.STORE_NAME] || 'Giovana Dias Joias'
  const logoUrl = storeSettings[SETTINGS_KEYS.STORE_LOGO] || null
  const bannerUrl = storeSettings[SETTINGS_KEYS.STORE_BANNER_URL] || null

  const bannerTitlePt = storeSettings[SETTINGS_KEYS.STORE_BANNER_TITLE] || storeName
  const bannerTitle = currentLocale === 'en'
    ? (storeSettings[SETTINGS_KEYS.STORE_BANNER_TITLE_EN] || bannerTitlePt)
    : currentLocale === 'es'
    ? (storeSettings[SETTINGS_KEYS.STORE_BANNER_TITLE_ES] || bannerTitlePt)
    : bannerTitlePt

  const bannerSubtitlePt = storeSettings[SETTINGS_KEYS.STORE_BANNER_SUBTITLE] || dict.store.bannerSubtitle
  const bannerSubtitle = currentLocale === 'en'
    ? (storeSettings[SETTINGS_KEYS.STORE_BANNER_SUBTITLE_EN] || bannerSubtitlePt)
    : currentLocale === 'es'
    ? (storeSettings[SETTINGS_KEYS.STORE_BANNER_SUBTITLE_ES] || bannerSubtitlePt)
    : bannerSubtitlePt

  return (
    <>
      <StoreHeader storeName={storeName} logoUrl={logoUrl} user={user} dict={dict} />
      <main className="container" style={{ margin: '0 auto', paddingBottom: 60 }}>
        {bannerUrl ? (
          <section style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', margin: '16px 0 32px', minHeight: 'unset' }}>
            <img src={bannerUrl} alt={bannerTitle} style={{ width: '100%', height: 'clamp(200px, 40vw, 360px)', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(16px, 5vw, 40px)' }}>
              <h1 style={{ fontSize: 'clamp(1.5rem, 6vw, 3.2rem)', fontWeight: 800, color: 'white', marginBottom: 8, textShadow: '0 2px 12px rgba(0,0,0,0.5)', maxWidth: '80%' }}>
                {bannerTitle}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(0.85rem, 2vw, 1.1rem)', maxWidth: 400 }}>
                {bannerSubtitle}
              </p>
            </div>
          </section>
        ) : (
          <section style={{ padding: '40px 0 30px', textAlign: 'center' }}>
            <h1 style={{ fontSize: 'clamp(1.8rem, 8vw, 3.5rem)', fontWeight: 800, background: 'linear-gradient(135deg,var(--primary),#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 12 }}>
              {bannerTitle}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              {bannerSubtitle}
            </p>
          </section>
        )}

        <ProductFilter
          initialProducts={productsData.products}
          initialTotal={productsData.total}
          initialPages={productsData.pages}
          categories={categories}
          dict={dict}
          locale={currentLocale}
          initialSearch={params.search}
          initialCategory={params.category}
          productsPerPage={parseInt(storeSettings[SETTINGS_KEYS.STORE_PRODUCTS_PER_PAGE] || '24')}
          installments={parseInt(storeSettings[SETTINGS_KEYS.STORE_INSTALLMENTS] || '0')}
          installmentsMinValue={parseFloat(storeSettings[SETTINGS_KEYS.STORE_INSTALLMENTS_MIN_VALUE] || '0')}
        />
      </main>
      <StoreFooter storeName={storeName} dict={dict} footerText={storeSettings[SETTINGS_KEYS.STORE_FOOTER_TEXT] || undefined} logoUrl={logoUrl} />
    </>
  )
}
