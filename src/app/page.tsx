import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSetting, getSettings, SETTINGS_KEYS } from '@/lib/config'
import { getAuthUser } from '@/lib/auth'
import { StoreHeader } from '@/components/store/StoreHeader'
import { ProductCard } from '@/components/store/ProductCard'
import { StoreFooter } from '@/components/store/StoreFooter'
import { cookies } from 'next/headers'
import { dictionaries, defaultLocale, Locale, translateDb } from '@/lib/i18n'

export const revalidate = 60

async function getProducts(search?: string, category?: string) {
  const where: Record<string, unknown> = { active: true }
  if (category) where.category = { slug: category }
  if (search) where.name = { contains: search, mode: 'insensitive' }
  return prisma.product.findMany({
    where,
    include: {
      category: true,
      options: true,
      variants: true
    },
    orderBy: { createdAt: 'desc' },
    take: 48,
  })
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } })
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>
}) {
  const params = await searchParams
  const [products, categories, storeSettings, user, cookieStore] = await Promise.all([
    getProducts(params.search, params.category),
    getCategories(),
    getSettings([
      SETTINGS_KEYS.STORE_NAME,
      SETTINGS_KEYS.STORE_LOGO,
      SETTINGS_KEYS.STORE_BANNER_URL,
      SETTINGS_KEYS.STORE_BANNER_TITLE,
      SETTINGS_KEYS.STORE_BANNER_SUBTITLE,
    ]),
    getAuthUser(),
    cookies(),
  ])

  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale
  const currentLocale = (localeCookie && dictionaries[localeCookie]) ? localeCookie : defaultLocale
  const dict = dictionaries[currentLocale]

  const storeName = storeSettings[SETTINGS_KEYS.STORE_NAME] || 'Velour'
  const logoUrl = storeSettings[SETTINGS_KEYS.STORE_LOGO] || null
  const bannerUrl = storeSettings[SETTINGS_KEYS.STORE_BANNER_URL] || null
  const bannerTitle = storeSettings[SETTINGS_KEYS.STORE_BANNER_TITLE] || storeName
  const bannerSubtitle = storeSettings[SETTINGS_KEYS.STORE_BANNER_SUBTITLE] || 'Produtos selecionados com qualidade e cuidado'

  return (
    <>
      <StoreHeader storeName={storeName} logoUrl={logoUrl} user={user} dict={dict} />
      <main className="container" style={{ margin: '0 auto', paddingBottom: 60 }}>
        {/* Hero Banner */}
        {bannerUrl ? (
          <section style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', margin: '16px 0 32px', minHeight: 'unset' }}>
            <img src={bannerUrl} alt={bannerTitle} style={{ width: '100%', height: 'clamp(200px, 40vw, 360px)', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(16px, 5vw, 40px)' }}>
              <h1 style={{ fontSize: 'clamp(1.5rem, 6vw, 3.2rem)', fontWeight: 800, color: 'white', marginBottom: 8, textShadow: '0 2px 12px rgba(0,0,0,0.5)', maxWidth: '80%' }}>
                {translateDb(bannerTitle, currentLocale)}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(0.85rem, 2vw, 1.1rem)', maxWidth: 400 }}>
                {translateDb(bannerSubtitle, currentLocale)}
              </p>
            </div>
          </section>
        ) : (
          <section style={{ padding: '40px 0 30px', textAlign: 'center' }}>
            <h1 style={{ fontSize: 'clamp(1.8rem, 8vw, 3.5rem)', fontWeight: 800, background: 'linear-gradient(135deg,var(--primary),#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 12 }}>
              {translateDb(bannerTitle, currentLocale)}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              {translateDb(bannerSubtitle, currentLocale)}
            </p>
          </section>
        )}

        {/* Filtros */}
        <form method="GET" className="filter-form" style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
          <input
            type="text"
            name="search"
            placeholder={dict.store.search}
            defaultValue={params.search}
            className="input"
            style={{ flex: '1 1 200px' }}
          />
          <select name="category" className="input" style={{ flex: '1 1 150px', maxWidth: 'unset' }} defaultValue={params.category || ''}>
            <option value="">{dict.store.categoryAll}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{translateDb(c.name, currentLocale)}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary" style={{ flex: '1 1 100px' }}>{dict.store.searchBtn}</button>
        </form>

        {/* Grid de Produtos */}
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>
            <p style={{ fontSize: '1.2rem' }}>{dict.store.noProducts}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'clamp(12px, 2vw, 24px)' }}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} dict={dict.product} locale={currentLocale} />
            ))}
          </div>
        )}
      </main>
      <StoreFooter storeName={storeName} dict={dict} />
    </>
  )
}
