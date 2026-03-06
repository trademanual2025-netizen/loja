import { NextRequest, NextResponse } from 'next/server'
import { getAdminEmailFromRequest, unauthorizedResponse } from '@/lib/admin-auth'
import { getSettings } from '@/lib/config'

export async function GET(req: NextRequest) {
    const email = getAdminEmailFromRequest(req)
    if (!email) return unauthorizedResponse()

    const settings = await getSettings(['evolution_api_url', 'evolution_api_key', 'evolution_instance_name'])
    const { evolution_api_url: url, evolution_api_key: key, evolution_instance_name: instance } = settings

    if (!url || !key || !instance) {
        return NextResponse.json({ state: 'unconfigured' })
    }

    try {
        const base = url.replace(/\/$/, '')
        const res = await fetch(`${base}/instance/connectionState/${instance}`, {
            headers: { apikey: key },
            signal: AbortSignal.timeout(8000),
        })

        if (!res.ok) {
            return NextResponse.json({ state: 'error', message: `Erro ${res.status} da Evolution API` })
        }

        const data = await res.json()
        const state = data?.instance?.state ?? data?.state ?? 'unknown'
        return NextResponse.json({ state, raw: data })
    } catch (err: any) {
        return NextResponse.json({ state: 'error', message: err.message || 'Falha ao conectar à Evolution API' })
    }
}
