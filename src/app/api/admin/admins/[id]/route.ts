import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// DELETE — remove admin
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        await prisma.adminUser.delete({ where: { id } })
        return NextResponse.json({ ok: true })
    } catch {
        return NextResponse.json({ error: 'Admin não encontrado.' }, { status: 404 })
    }
}

// PATCH — altera senha do admin
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { password } = await req.json()
    if (!password)
        return NextResponse.json({ error: 'Nova senha é obrigatória.' }, { status: 400 })

    const hashed = crypto.createHash('sha256').update(password).digest('hex')
    await prisma.adminUser.update({ where: { id }, data: { password: hashed } })
    return NextResponse.json({ ok: true })
}
