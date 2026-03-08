import { NextRequest, NextResponse } from 'next/server'
import { getSetting, SETTINGS_KEYS } from '@/lib/config'
import crypto from 'crypto'

function hashData(value: string): string {
    return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex')
}

export async function POST(req: NextRequest) {
    const body = await req.json()
    const {
        event_name,
        event_id,
        value,
        currency = 'BRL',
        content_ids,
        content_name,
        content_type,
        num_items,
        order_id,
        user_data,
        fbc,
        fbp,
        event_source_url,
    } = body

    const pixelId = await getSetting(SETTINGS_KEYS.FB_PIXEL_ID)
    const token = await getSetting(SETTINGS_KEYS.FB_CAPI_TOKEN)

    if (!pixelId || !token) {
        return NextResponse.json({ error: 'Pixel não configurado' }, { status: 400 })
    }

    const userData: Record<string, unknown> = {
        client_ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '',
        client_user_agent: req.headers.get('user-agent') || '',
    }

    if (user_data?.email) userData.em = [hashData(user_data.email)]
    if (user_data?.phone) userData.ph = [hashData(user_data.phone.replace(/\D/g, ''))]
    if (user_data?.firstName) userData.fn = [hashData(user_data.firstName)]
    if (user_data?.lastName) userData.ln = [hashData(user_data.lastName)]
    if (user_data?.city) userData.ct = [hashData(user_data.city)]
    if (user_data?.state) userData.st = [hashData(user_data.state)]
    if (user_data?.zipCode) userData.zp = [hashData(user_data.zipCode.replace(/\D/g, ''))]
    if (user_data?.country) userData.country = [hashData(user_data.country.toLowerCase())]
    if (user_data?.externalId) userData.external_id = [hashData(user_data.externalId)]
    if (fbc) userData.fbc = fbc
    if (fbp) userData.fbp = fbp

    const customData: Record<string, unknown> = {}
    if (value !== undefined) customData.value = value
    if (currency) customData.currency = currency
    if (order_id) customData.order_id = order_id
    if (content_ids) customData.content_ids = content_ids
    if (content_name) customData.content_name = content_name
    if (content_type) customData.content_type = content_type
    if (num_items !== undefined) customData.num_items = num_items

    const eventData: Record<string, unknown> = {
        event_name,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: userData,
        custom_data: customData,
    }

    if (event_id) eventData.event_id = event_id
    if (event_source_url) eventData.event_source_url = event_source_url

    try {
        const res = await fetch(
            `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${token}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: [eventData] }),
            }
        )
        const data = await res.json()
        if (!res.ok) {
            console.error('[CAPI] Error response:', JSON.stringify(data))
        }
        return NextResponse.json(data)
    } catch (err) {
        console.error('[CAPI] Fetch error:', err)
        return NextResponse.json({ error: 'CAPI error' }, { status: 500 })
    }
}
