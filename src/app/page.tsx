import Link from 'next/link'
import { getSettings, SETTINGS_KEYS } from '@/lib/config'
import { getAuthUser } from '@/lib/auth'
import { cookies } from 'next/headers'
import { dictionaries, defaultLocale, Locale } from '@/lib/i18n'
import { LandingPageClient } from '@/components/store/LandingPageClient'
import { sanitizeHtml } from '@/lib/sanitize'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
    const [seoSettings, cookieStore] = await Promise.all([
        getSettings([SETTINGS_KEYS.SEO_META_TITLE, SETTINGS_KEYS.SEO_META_DESCRIPTION, SETTINGS_KEYS.SEO_OG_IMAGE, SETTINGS_KEYS.STORE_NAME]),
        cookies(),
    ])

    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale
    const currentLocale = (localeCookie && dictionaries[localeCookie]) ? localeCookie : defaultLocale

    const storeName = seoSettings[SETTINGS_KEYS.STORE_NAME] || 'Giovana Dias Joias'
    const title = seoSettings[SETTINGS_KEYS.SEO_META_TITLE] || `${storeName} — Joias Artesanais`
    const defaultDescs: Record<Locale, string> = {
        pt: 'Joias artesanais exclusivas feitas à mão por Giovana Dias. Peças autorais em prata e ouro.',
        en: 'Exclusive handcrafted jewelry by Giovana Dias. Artisan pieces in silver and gold.',
        es: 'Joyas artesanales exclusivas hechas a mano por Giovana Dias. Piezas autorales en plata y oro.',
    }
    const description = seoSettings[SETTINGS_KEYS.SEO_META_DESCRIPTION] || defaultDescs[currentLocale]
    const ogImage = seoSettings[SETTINGS_KEYS.SEO_OG_IMAGE] || undefined

    return {
        title: { absolute: title },
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            ...(ogImage ? { images: [{ url: ogImage }] } : {}),
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            ...(ogImage ? { images: [ogImage] } : {}),
        },
    }
}

export const revalidate = 60

export default async function LandingPage() {
  const [storeSettings, landingSettings, user, cookieStore] = await Promise.all([
    getSettings([
      SETTINGS_KEYS.STORE_NAME,
      SETTINGS_KEYS.STORE_LOGO,
    ]),
    getSettings([
      SETTINGS_KEYS.LANDING_HERO_IMAGE,
      SETTINGS_KEYS.LANDING_HERO_TITLE,
      SETTINGS_KEYS.LANDING_HERO_SUBTITLE,
      SETTINGS_KEYS.LANDING_CTA_TEXT,
      SETTINGS_KEYS.LANDING_WHATSAPP,
      SETTINGS_KEYS.LANDING_INSTAGRAM,
      SETTINGS_KEYS.LANDING_EMAIL,
      SETTINGS_KEYS.LANDING_PHONE,
      SETTINGS_KEYS.LANDING_CUSTOM_BANNER_IMAGE,
      SETTINGS_KEYS.LANDING_CUSTOM_BANNER_TITLE,
      SETTINGS_KEYS.LANDING_CUSTOM_BANNER_TEXT,
      SETTINGS_KEYS.LANDING_ABOUT_TEXT,
    ]),
    getAuthUser(),
    cookies(),
  ])

  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale
  const currentLocale = (localeCookie && dictionaries[localeCookie]) ? localeCookie : defaultLocale
  const dict = dictionaries[currentLocale]

  const storeName = storeSettings[SETTINGS_KEYS.STORE_NAME] || 'Loja Virtual'
  const logoUrl = storeSettings[SETTINGS_KEYS.STORE_LOGO] || null

  return (
    <LandingPageClient
      storeName={storeName}
      logoUrl={logoUrl}
      user={user}
      dict={dict}
      heroImage={landingSettings[SETTINGS_KEYS.LANDING_HERO_IMAGE] || ''}
      heroTitle={currentLocale === 'pt' ? (landingSettings[SETTINGS_KEYS.LANDING_HERO_TITLE] || dict.landing.heroTitle) : dict.landing.heroTitle}
      heroSubtitle={currentLocale === 'pt' ? (landingSettings[SETTINGS_KEYS.LANDING_HERO_SUBTITLE] || dict.landing.heroSubtitle) : dict.landing.heroSubtitle}
      ctaText={currentLocale === 'pt' ? (landingSettings[SETTINGS_KEYS.LANDING_CTA_TEXT] || dict.landing.ctaText) : dict.landing.ctaText}
      whatsapp={landingSettings[SETTINGS_KEYS.LANDING_WHATSAPP] || ''}
      instagram={landingSettings[SETTINGS_KEYS.LANDING_INSTAGRAM] || ''}
      email={landingSettings[SETTINGS_KEYS.LANDING_EMAIL] || ''}
      phone={landingSettings[SETTINGS_KEYS.LANDING_PHONE] || ''}
      customBannerImage={landingSettings[SETTINGS_KEYS.LANDING_CUSTOM_BANNER_IMAGE] || '/custom-jewelry-banner.png'}
      customBannerTitle={currentLocale === 'pt' ? (landingSettings[SETTINGS_KEYS.LANDING_CUSTOM_BANNER_TITLE] || '') : ''}
      customBannerText={currentLocale === 'pt' ? (landingSettings[SETTINGS_KEYS.LANDING_CUSTOM_BANNER_TEXT] || '') : ''}
      aboutText={sanitizeHtml(landingSettings[SETTINGS_KEYS.LANDING_ABOUT_TEXT] || '')}
    />
  )
}
