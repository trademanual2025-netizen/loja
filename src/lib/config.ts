/**
 * Carrega configurações salvas no banco (tabela Settings).
 * Utilizado para obter chaves de API, Pixel IDs, URLs de webhooks, etc.
 */

import { prisma } from './prisma'

const cache: Record<string, string> = {}

export async function getSetting(key: string): Promise<string | null> {
    if (cache[key]) return cache[key]
    try {
        const setting = await prisma.settings.findUnique({ where: { key } })
        if (setting) {
            cache[key] = setting.value
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
    cache[key] = value
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
    const settings = await prisma.settings.findMany({
        where: { key: { in: keys } },
    })
    const result: Record<string, string> = {}
    for (const s of settings) {
        result[s.key] = s.value
        cache[s.key] = s.value
    }
    return result
}

// Chaves de configuração
export const SETTINGS_KEYS = {
    // Facebook
    FB_PIXEL_ID: 'fb_pixel_id',
    FB_CAPI_TOKEN: 'fb_capi_token',
    FB_PIXEL_ENABLED: 'fb_pixel_enabled',
    // Google
    GOOGLE_ADS_ID: 'google_ads_id',
    GOOGLE_ADS_LABEL: 'google_ads_label',
    GOOGLE_ADS_ENABLED: 'google_ads_enabled',
    // Mercado Pago
    MP_PUBLIC_KEY: 'mp_public_key',
    MP_ACCESS_TOKEN: 'mp_access_token',
    MP_ENABLED: 'mp_enabled',
    // Stripe
    STRIPE_PUBLIC_KEY: 'stripe_public_key',
    STRIPE_SECRET_KEY: 'stripe_secret_key',
    STRIPE_WEBHOOK_SECRET: 'stripe_webhook_secret',
    STRIPE_ENABLED: 'stripe_enabled',
    // Webhooks
    WEBHOOK_LEAD_URL: 'webhook_lead_url',
    WEBHOOK_BUYER_URL: 'webhook_buyer_url',
    // Frete
    SHIPPING_MODE: 'shipping_mode',       // 'free' | 'fixed' | 'by_state' | 'correios'
    SHIPPING_FIXED_VALUE: 'shipping_fixed_value',
    SHIPPING_FREE_ABOVE: 'shipping_free_above',
    SHIPPING_STATE_TABLE: 'shipping_state_table', // JSON
    // Frete Correios
    SHIPPING_ORIGIN_CEP: 'shipping_origin_cep',
    SHIPPING_DEFAULT_WEIGHT: 'shipping_default_weight', // kg, ex: '0.5'
    SHIPPING_DEFAULT_HEIGHT: 'shipping_default_height', // cm
    SHIPPING_DEFAULT_WIDTH: 'shipping_default_width',   // cm
    SHIPPING_DEFAULT_LENGTH: 'shipping_default_length', // cm
    SHIPPING_CORREIOS_USER: 'shipping_correios_user',   // opcional (contrato)
    SHIPPING_CORREIOS_PASS: 'shipping_correios_pass',   // opcional (contrato)
    // Loja
    STORE_NAME: 'store_name',
    STORE_LOGO: 'store_logo',
    STORE_FAVICON: 'store_favicon',
    STORE_PRIMARY_COLOR: 'store_primary_color',
    STORE_FOOTER_TEXT: 'store_footer_text',
    STORE_BANNER_URL: 'store_banner_url',
    STORE_BANNER_TITLE: 'store_banner_title',
    STORE_BANNER_SUBTITLE: 'store_banner_subtitle',
    // SEO
    SEO_META_TITLE: 'seo_meta_title',
    SEO_META_DESCRIPTION: 'seo_meta_description',
    SEO_OG_IMAGE: 'seo_og_image',
    // Admin
    ADMIN_SETUP_DONE: 'admin_setup_done',
} as const
