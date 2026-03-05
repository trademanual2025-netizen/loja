import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, getIP } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
    const ip = getIP(req)
    const { allowed } = rateLimit(`ping:${ip}`, 30, 60 * 1000)
    if (!allowed) {
        return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
    }

    try {
        await prisma.$queryRaw`SELECT 1`
        return NextResponse.json({ ok: true, ts: new Date().toISOString() })
    } catch {
        return NextResponse.json({ ok: false }, { status: 500 })
    }
}
