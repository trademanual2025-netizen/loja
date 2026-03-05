import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

async function getAdmin(req: NextRequest) {
    const email = req.headers.get('x-admin-email')
    if (!email) return null
    return prisma.adminUser.findUnique({
        where: { email },
        select: { id: true, name: true, email: true, avatarUrl: true, password: true },
    })
}

export async function GET(req: NextRequest) {
    const admin = await getAdmin(req)
    if (!admin) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    const { password: _p, ...safe } = admin
    return NextResponse.json(safe)
}

export async function PATCH(req: NextRequest) {
    const admin = await getAdmin(req)
    if (!admin) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

    const body = await req.json()
    const data: { name?: string; avatarUrl?: string | null; password?: string } = {}

    if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim()
    if ('avatarUrl' in body) data.avatarUrl = body.avatarUrl

    if (body.currentPassword || body.newPassword) {
        if (!body.currentPassword || !body.newPassword)
            return NextResponse.json({ error: 'Informe a senha atual e a nova senha.' }, { status: 400 })
        if (body.newPassword.length < 6)
            return NextResponse.json({ error: 'Nova senha deve ter no mínimo 6 caracteres.' }, { status: 400 })
        const valid = await bcrypt.compare(body.currentPassword, admin.password)
        if (!valid)
            return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 400 })
        data.password = await bcrypt.hash(body.newPassword, 10)
    }

    if (Object.keys(data).length === 0)
        return NextResponse.json({ error: 'Nenhum dado para atualizar.' }, { status: 400 })

    const updated = await prisma.adminUser.update({
        where: { id: admin.id },
        data,
        select: { id: true, name: true, email: true, avatarUrl: true },
    })
    return NextResponse.json(updated)
}
