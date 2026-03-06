import { NextRequest, NextResponse } from 'next/server'
import { getAdminEmailFromRequest, unauthorizedResponse } from '@/lib/admin-auth'
import { getSettings } from '@/lib/config'

export async function POST(req: NextRequest) {
    const email = getAdminEmailFromRequest(req)
    if (!email) return unauthorizedResponse()

    const settings = await getSettings(['evolution_api_url', 'evolution_api_key', 'evolution_instance_name'])
    const { evolution_api_url: url, evolution_api_key: key, evolution_instance_name: instance } = settings

    if (!url || !key || !instance) {
        return NextResponse.json({ error: 'Evolution API não configurada.' }, { status: 400 })
    }

    try {
        const base = url.replace(/\/$/, '')
        const res = await fetch(`${base}/instance/logout/${instance}`, {
            method: 'DELETE',
            headers: { apikey: key },
            signal: AbortSignal.timeout(8000),
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
            return NextResponse.json({ error: `Erro ${res.status}`, raw: data }, { status: 400 })
        }

        return NextResponse.json({ ok: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Falha ao desconectar' }, { status: 500 })
    }
}
