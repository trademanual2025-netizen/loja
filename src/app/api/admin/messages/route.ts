import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission, forbiddenResponse } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
    const perm = await requirePermission(req, 'mensagens')
    if (!perm) return forbiddenResponse()

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = 20
    const skip = (page - 1) * limit

    const [messages, total] = await Promise.all([
        prisma.contactMessage.findMany({
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.contactMessage.count(),
    ])

    return NextResponse.json({ messages, total })
}

export async function PATCH(req: NextRequest) {
    const perm = await requirePermission(req, 'mensagens')
    if (!perm) return forbiddenResponse()

    const { id, read } = await req.json()
    const updated = await prisma.contactMessage.update({ where: { id }, data: { read } })
    return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
    const perm = await requirePermission(req, 'mensagens')
    if (!perm) return forbiddenResponse()

    const { id } = await req.json()
    await prisma.contactMessage.delete({ where: { id } })
    return NextResponse.json({ ok: true })
}
