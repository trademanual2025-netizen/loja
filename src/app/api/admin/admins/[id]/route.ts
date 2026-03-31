import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminInfoFromRequest, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth'
import bcrypt from 'bcryptjs'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const info = await getAdminInfoFromRequest(req)
    if (!info) return unauthorizedResponse()
    if (info.role !== 'superadmin') return forbiddenResponse()

    try {
        const admin = await prisma.adminUser.findUnique({ where: { id } })
        if (!admin) return NextResponse.json({ error: 'Admin não encontrado.' }, { status: 404 })
        if (admin.role === 'superadmin') return NextResponse.json({ error: 'Não é possível remover um superadmin.' }, { status: 403 })

        await prisma.adminUser.delete({ where: { id } })
        return NextResponse.json({ ok: true })
    } catch (err) {
        console.error('Erro ao deletar admin:', err)
        return NextResponse.json({ error: 'Erro interno ao deletar admin.' }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const info = await getAdminInfoFromRequest(req)
    if (!info) return unauthorizedResponse()
    if (info.role !== 'superadmin') return forbiddenResponse()

    const body = await req.json()
    const data: { password?: string; permissions?: string[] } = {}

    if (body.password) {
        if (body.password.length < 6)
            return NextResponse.json({ error: 'Nova senha deve ter no mínimo 6 caracteres.' }, { status: 400 })
        data.password = await bcrypt.hash(body.password, 10)
    }

    if (Array.isArray(body.permissions)) {
        const target = await prisma.adminUser.findUnique({ where: { id }, select: { role: true } })
        if (target?.role === 'superadmin')
            return NextResponse.json({ error: 'Não é possível alterar permissões de um superadmin.' }, { status: 403 })
        data.permissions = body.permissions
    }

    if (Object.keys(data).length === 0)
        return NextResponse.json({ error: 'Nenhum dado para atualizar.' }, { status: 400 })

    const updated = await prisma.adminUser.update({
        where: { id },
        data,
        select: { id: true, name: true, email: true, role: true, permissions: true, createdAt: true },
    })
    return NextResponse.json(updated)
}
