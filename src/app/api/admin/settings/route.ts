import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/settings — retorna todas as configurações
export async function GET() {
    const settings = await prisma.settings.findMany()
    const map: Record<string, string> = {}
    for (const s of settings) map[s.key] = s.value
    return NextResponse.json(map)
}

// POST /api/admin/settings — atualiza múltiplas configurações
export async function POST(req: NextRequest) {
    const body: Record<string, string> = await req.json()

    await Promise.all(
        Object.entries(body).map(([key, value]) =>
            prisma.settings.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) },
            })
        )
    )

    return NextResponse.json({ ok: true })
}
