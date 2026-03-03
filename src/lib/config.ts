import { prisma } from './prisma'

const cache = new Map<string, { value: string; ts: number }>()
const CACHE_TTL = 60_000

export async function getSetting(key: string): Promise<string | null> {
    const cached = cache.get(key)
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.value
    try {
        const setting = await prisma.settings.findUnique({ where: { key } })
        if (setting) {
            cache.set(key, { value: setting.value, ts: Date.now() })
            return setting.value
        }
    } catch { }
    return null
}

export async function setSetting(key: string, value: string): Promise<void> {
    await prisma.settings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    })
    cache.set(key, { value, ts: Date.now() })
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
    const now = Date.now()
    const missing = keys.filter(k => {
        const c = cache.get(k)
        return !c || now - c.ts >= CACHE_TTL
    })

    if (missing.length > 0) {
        const settings = await prisma.settings.findMany({
            where: { key: { in: missing } },
        })
        for (const s of settings) {
            cache.set(s.key, { value: s.value, ts: now })
        }
    }

    const result: Record<string, string> = {}
    for (const k of keys) {
        const c = cache.get(k)
        if (c) result[k] = c.value
    }
    return result
}

export const SETTINGS_KEYS = {
    FB_PIXEL_ID: 'fb_pixel_id',
    FB_CAPI_TOKEN: 'fb_capi_token',
    FB_PIXEL_ENABLED: 'fb_pixel_enabled',
    GOOGLE_ADS_ID: 'google_ads_id',
    GOOGLE_ADS_LABEL: 'google_ads_label',
    GOOGLE_ADS_ENABLED: 'google_ads_enabled',
    MP_PUBLIC_KEY: 'mp_public_key',
    MP_ACCESS_TOKEN: 'mp_access_token',
    MP_ENABLED: 'mp_enabled',
    STRIPE_PUBLIC_KEY: 'stripe_public_key',
    STRIPE_SECRET_KEY: 'stripe_secret_key',
    STRIPE_WEBHOOK_SECRET: 'stripe_webhook_secret',
    STRIPE_ENABLED: 'stripe_enabled',
    PAYMENT_GATEWAY_MODE: 'payment_gateway_mode',
    WEBHOOK_LEAD_URL: 'webhook_lead_url',
    WEBHOOK_BUYER_URL: 'webhook_buyer_url',
    SHIPPING_MODE: 'shipping_mode',
    SHIPPING_FIXED_VALUE: 'shipping_fixed_value',
    SHIPPING_FREE_ABOVE: 'shipping_free_above',
    SHIPPING_STATE_TABLE: 'shipping_state_table',
    SHIPPING_ORIGIN_CEP: 'shipping_origin_cep',
    SHIPPING_DEFAULT_WEIGHT: 'shipping_default_weight',
    SHIPPING_DEFAULT_HEIGHT: 'shipping_default_height',
    SHIPPING_DEFAULT_WIDTH: 'shipping_default_width',
    SHIPPING_DEFAULT_LENGTH: 'shipping_default_length',
    SHIPPING_CORREIOS_USER: 'shipping_correios_user',
    SHIPPING_CORREIOS_PASS: 'shipping_correios_pass',
    STORE_NAME: 'store_name',
    STORE_LOGO: 'store_logo',
    STORE_FAVICON: 'store_favicon',
    STORE_PRIMARY_COLOR: 'store_primary_color',
    STORE_TEXT_COLOR: 'store_text_color',
    STORE_BG_COLOR: 'store_bg_color',
    STORE_BG_CARD_COLOR: 'store_bg_card_color',
    STORE_TEXT_TITLE: 'store_text_title',
    STORE_BTN_BUY: 'store_btn_buy',
    STORE_BTN_HEADER: 'store_btn_header',
    STORE_ICON_CART: 'store_icon_cart',
    STORE_FOOTER_TEXT: 'store_footer_text',
    STORE_BANNER_URL: 'store_banner_url',
    STORE_BANNER_TITLE: 'store_banner_title',
    STORE_BANNER_SUBTITLE: 'store_banner_subtitle',
    SEO_META_TITLE: 'seo_meta_title',
    SEO_META_DESCRIPTION: 'seo_meta_description',
    SEO_OG_IMAGE: 'seo_og_image',
    STORE_PRODUCTS_PER_PAGE: 'store_products_per_page',
    STORE_INSTALLMENTS: 'store_installments',
    STORE_INSTALLMENTS_MIN_VALUE: 'store_installments_min_value',
    ADMIN_SETUP_DONE: 'admin_setup_done',
    LANDING_HERO_IMAGE: 'landing_hero_image',
    LANDING_HERO_TITLE: 'landing_hero_title',
    LANDING_HERO_SUBTITLE: 'landing_hero_subtitle',
    LANDING_CTA_TEXT: 'landing_cta_text',
    LANDING_WHATSAPP: 'landing_whatsapp',
    LANDING_INSTAGRAM: 'landing_instagram',
    LANDING_EMAIL: 'landing_email',
    LANDING_CUSTOM_BANNER_IMAGE: 'landing_custom_banner_image',
    LANDING_CUSTOM_BANNER_TITLE: 'landing_custom_banner_title',
    LANDING_CUSTOM_BANNER_TEXT: 'landing_custom_banner_text',
    LANDING_ABOUT_TEXT: 'landing_about_text',
    LANDING_PHONE: 'landing_phone',
} as const
