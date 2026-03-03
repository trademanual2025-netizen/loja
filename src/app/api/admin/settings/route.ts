import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { clearSettingsCache } from '@/lib/config'
import { revalidatePath } from 'next/cache'

export async function GET() {
    const settings = await prisma.settings.findMany()
    const map: Record<string, string> = {}
    for (const s of settings) map[s.key] = s.value
    return NextResponse.json(map)
}

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

    clearSettingsCache(Object.keys(body))

    revalidatePath('/', 'layout')
    revalidatePath('/loja', 'page')
    revalidatePath('/nossamarca', 'page')

    return NextResponse.json({ ok: true })
}
