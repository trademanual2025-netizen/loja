import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { dispatchLeadWebhook } from '@/lib/webhooks'
import { rateLimit, getIP } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
    try {
        const ip = getIP(req)
        const { allowed, retryAfterSeconds } = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000)
        if (!allowed) {
            return NextResponse.json(
                { error: `Muitas tentativas. Tente novamente em ${retryAfterSeconds} segundos.` },
                { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
            )
        }

        const { name, email, phone, cpf, password } = await req.json()

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 })
        }

        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 409 })
        }

        const hashed = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: { name, email, phone, cpf, password: hashed },
        })

        const lead = await prisma.lead.create({
            data: { userId: user.id, source: 'checkout' },
        })

        dispatchLeadWebhook({
            ...lead,
            user: { name: user.name, email: user.email, phone: user.phone, cpf: user.cpf },
        }).catch((err) => { console.error('[Webhook] Lead dispatch failed:', err) })

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
        })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
    }
}
