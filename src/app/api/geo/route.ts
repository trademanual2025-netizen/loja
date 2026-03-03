import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || '127.0.0.1'

        if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
            return NextResponse.json({ country: 'BR', ip })
        }

        const res = await fetch(`https://ipapi.co/${ip}/json/`, {
            signal: AbortSignal.timeout(4000),
            headers: { 'User-Agent': 'giovana-dias-store/1.0' },
        })

        if (res.ok) {
            const data = await res.json()
            if (data.country_code) {
                return NextResponse.json({ country: data.country_code, ip })
            }
        }
    } catch {
        // fallback below
    }

    return NextResponse.json({ country: 'BR' })
}
