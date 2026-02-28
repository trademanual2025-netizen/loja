import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const admin = await prisma.adminUser.findUnique({ where: { id } })
        if (!admin) {
            return NextResponse.json({ error: 'Admin não encontrado.' }, { status: 404 })
        }
        await prisma.adminUser.delete({ where: { id } })
        return NextResponse.json({ ok: true })
    } catch (err) {
        console.error('Erro ao deletar admin:', err)
        return NextResponse.json({ error: 'Erro interno ao deletar admin.' }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { password } = await req.json()
    if (!password || password.length < 6)
        return NextResponse.json({ error: 'Nova senha deve ter no mínimo 6 caracteres.' }, { status: 400 })

    const hashed = await bcrypt.hash(password, 10)
    await prisma.adminUser.update({ where: { id }, data: { password: hashed } })
    return NextResponse.json({ ok: true })
}
