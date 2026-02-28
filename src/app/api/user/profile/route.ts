import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verify } from 'jsonwebtoken'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'loja-secret-change-in-production'

async function getUser(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return null
    try {
        return verify(token, JWT_SECRET) as { id: string; email: string; name: string }
    } catch {
        return null
    }
}

// GET — retorna perfil completo do usuário logado
export async function GET(req: NextRequest) {
    const session = await getUser(req)
    if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

    const user = await prisma.user.findUnique({
        where: { id: session.id },
        omit: { password: true },
        include: {
            orders: {
                orderBy: { createdAt: 'desc' },
                take: 20,
                include: {
                    items: { include: { product: { select: { name: true, images: true, slug: true } } } },
                },
            },
        },
    })
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    return NextResponse.json(user)
}

// PATCH — atualiza perfil (nome, telefone, endereço, avatar, senha)
export async function PATCH(req: NextRequest) {
    const session = await getUser(req)
    if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

    const body = await req.json()
    const { name, phone, zipCode, street, number, complement, neighborhood, city, state, avatarUrl, currentPassword, newPassword } = body

    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (zipCode !== undefined) updateData.zipCode = zipCode
    if (street !== undefined) updateData.street = street
    if (number !== undefined) updateData.number = number
    if (complement !== undefined) updateData.complement = complement
    if (neighborhood !== undefined) updateData.neighborhood = neighborhood
    if (city !== undefined) updateData.city = city
    if (state !== undefined) updateData.state = state
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl

    // Troca de senha
    if (newPassword) {
        if (!currentPassword) return NextResponse.json({ error: 'Informe a senha atual.' }, { status: 400 })
        const user = await prisma.user.findUnique({ where: { id: session.id } })
        const currentHash = crypto.createHash('sha256').update(currentPassword).digest('hex')
        if (user?.password !== currentHash)
            return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 400 })
        updateData.password = crypto.createHash('sha256').update(newPassword).digest('hex')
    }

    const updated = await prisma.user.update({
        where: { id: session.id },
        data: updateData,
        omit: { password: true },
    })
    return NextResponse.json(updated)
}
