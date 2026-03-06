import { NextRequest, NextResponse } from 'next/server'
import { getAdminEmailFromRequest, unauthorizedResponse } from '@/lib/admin-auth'
import { getSettings } from '@/lib/config'

export async function GET(req: NextRequest) {
    const email = getAdminEmailFromRequest(req)
    if (!email) return unauthorizedResponse()

    const settings = await getSettings(['evolution_api_url', 'evolution_api_key', 'evolution_instance_name'])
    const { evolution_api_url: url, evolution_api_key: key, evolution_instance_name: instance } = settings

    if (!url || !key || !instance) {
        return NextResponse.json({ error: 'Evolution API não configurada.' }, { status: 400 })
    }

    try {
        const base = url.replace(/\/$/, '')
        const res = await fetch(`${base}/instance/connect/${instance}`, {
            headers: { apikey: key },
            signal: AbortSignal.timeout(15000),
        })

        if (!res.ok) {
            const text = await res.text()
            return NextResponse.json({ error: `Erro ${res.status}: ${text.substring(0, 200)}` }, { status: 400 })
        }

        const data = await res.json()
        const base64 = data?.base64 ?? data?.qrcode?.base64 ?? data?.code ?? null

        if (!base64) {
            return NextResponse.json({ error: 'QR Code não disponível. O WhatsApp pode já estar conectado ou a instância não existe.', raw: data }, { status: 400 })
        }

        const src = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`
        return NextResponse.json({ src })
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Falha ao conectar à Evolution API' }, { status: 500 })
    }
}
