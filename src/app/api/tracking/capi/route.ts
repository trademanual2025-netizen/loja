import { NextRequest, NextResponse } from 'next/server'
import { getSetting, SETTINGS_KEYS } from '@/lib/config'
import crypto from 'crypto'

function hashData(value: string) {
    return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex')
}

export async function POST(req: NextRequest) {
    const body = await req.json()
    const { event_name, value, currency = 'BRL', email, phone, order_id, user_agent, ip } = body

    const pixelId = await getSetting(SETTINGS_KEYS.FB_PIXEL_ID)
    const token = await getSetting(SETTINGS_KEYS.FB_CAPI_TOKEN)

    if (!pixelId || !token) {
        return NextResponse.json({ error: 'Pixel não configurado' }, { status: 400 })
    }

    const eventData: Record<string, unknown> = {
        event_name,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: {
            client_ip_address: ip || req.headers.get('x-forwarded-for') || '',
            client_user_agent: user_agent || req.headers.get('user-agent') || '',
            em: email ? [hashData(email)] : undefined,
            ph: phone ? [hashData(phone.replace(/\D/g, ''))] : undefined,
        },
        custom_data: {
            value,
            currency,
            order_id,
        },
    }

    try {
        const res = await fetch(
            `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${token}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: [eventData] }),
            }
        )
        const data = await res.json()
        return NextResponse.json(data)
    } catch (err) {
        return NextResponse.json({ error: 'CAPI error' }, { status: 500 })
    }
}
