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

export async function POST(req: NextRequest) {
    const perm = await requirePermission(req, 'settings')
    if (!perm) return forbiddenResponse()
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
    revalidateTag('settings', { expire: 300 })

    revalidatePath('/', 'layout')
    revalidatePath('/loja', 'page')
    revalidatePath('/nossamarca', 'page')
    revalidatePath('/contato', 'page')
    revalidatePath('/ringsize', 'page')
    revalidatePath('/carrinho', 'layout')

    return NextResponse.json({ ok: true })
}
