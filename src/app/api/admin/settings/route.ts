import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { clearSettingsCache } from '@/lib/config'
import { revalidatePath } from 'next/cache'
import { revalidateTag } from 'next/cache'
import { requirePermission, forbiddenResponse } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
    const settings = await prisma.settings.findMany()
    const map: Record<string, string> = {}
    for (const s of settings) map[s.key] = s.value
    return NextResponse.json(map)
}

const TRACKING_KEYS = ['fb_pixel_id', 'fb_capi_token', 'fb_pixel_enabled', 'google_ads_id', 'google_ads_label', 'google_ads_enabled']
const WEBHOOK_KEYS = ['webhook_lead_url', 'webhook_buyer_url', 'webhook_lead_enabled', 'webhook_buyer_enabled']
const FRETE_KEYS = ['shipping_mode', 'shipping_fixed_value', 'shipping_free_above', 'shipping_state_table', 'shipping_origin_cep', 'shipping_default_weight', 'shipping_default_height', 'shipping_default_width', 'shipping_default_length', 'shipping_correios_user', 'shipping_correios_pass']

function detectModule(keys: string[]): 'tracking' | 'webhooks' | 'frete' | 'settings' {
    if (keys.every(k => TRACKING_KEYS.includes(k))) return 'tracking'
    if (keys.every(k => WEBHOOK_KEYS.includes(k))) return 'webhooks'
    if (keys.every(k => FRETE_KEYS.includes(k))) return 'frete'
    return 'settings'
}

export async function POST(req: NextRequest) {
    const body: Record<string, string> = await req.json()
    const module = detectModule(Object.keys(body))
    const perm = await requirePermission(req, module)
    if (!perm) return forbiddenResponse()

    await Promise.all(
        Object.entries(body).map(([key, value]) =>
            prisma.settings.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) },
            })
        )
    )

    clearSettingsCache(Object.keys(body))
    revalidateTag('settings', { expire: 300 })

    revalidatePath('/', 'layout')
    revalidatePath('/loja', 'page')
    revalidatePath('/nossamarca', 'page')
    revalidatePath('/contato', 'page')
    revalidatePath('/ringsize', 'page')
    revalidatePath('/carrinho', 'layout')

    return NextResponse.json({ ok: true })
}
