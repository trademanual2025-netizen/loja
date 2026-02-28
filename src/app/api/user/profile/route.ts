import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verify } from 'jsonwebtoken'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || ''

async function getUser(req: NextRequest) {
    if (!JWT_SECRET) return null
    const token = req.cookies.get('auth_token')?.value
    if (!token) return null
    try {
        return verify(token, JWT_SECRET) as { id: string; email: string; name: string }
    } catch {
        return null
    }
}

export async function GET(req: NextRequest) {
    const session = await getUser(req)
    if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

    const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            zipCode: true,
            street: true,
            number: true,
            complement: true,
            neighborhood: true,
            city: true,
            state: true,
            active: true,
            orders: {
                orderBy: { createdAt: 'desc' },
                take: 20,
                select: {
                    id: true,
                    status: true,
                    total: true,
                    createdAt: true,
                    trackingCode: true,
                    trackingUrl: true,
                    shippingNote: true,
                    items: {
                        select: {
                            id: true,
                            quantity: true,
                            price: true,
                            product: { select: { name: true, images: true, slug: true } },
                        },
                    },
                },
            },
        },
    })
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    if (!user.active) return NextResponse.json({ error: 'Conta desativada.' }, { status: 403 })
    return NextResponse.json(user)
}

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

    if (newPassword) {
        if (!currentPassword) return NextResponse.json({ error: 'Informe a senha atual.' }, { status: 400 })
        if (newPassword.length < 6) return NextResponse.json({ error: 'Nova senha deve ter no mínimo 6 caracteres.' }, { status: 400 })
        const user = await prisma.user.findUnique({ where: { id: session.id } })
        if (!user) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

        let currentValid = false
        if (user.password.startsWith('$2')) {
            currentValid = await bcrypt.compare(currentPassword, user.password)
        } else {
            const currentHash = crypto.createHash('sha256').update(currentPassword).digest('hex')
            currentValid = user.password === currentHash
        }

        if (!currentValid)
            return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 400 })
        updateData.password = await bcrypt.hash(newPassword, 10)
    }

    const updated = await prisma.user.update({
        where: { id: session.id },
        data: updateData,
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            zipCode: true,
            street: true,
            number: true,
            complement: true,
            neighborhood: true,
            city: true,
            state: true,
        },
    })
    return NextResponse.json(updated)
}
