import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { dispatchLeadWebhook } from '@/lib/webhooks'

export async function POST(req: NextRequest) {
    try {
        const { name, email, phone, cpf, password } = await req.json()

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 })
        }

        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 409 })
        }

        const hashed = crypto.createHash('sha256').update(password).digest('hex')

        const user = await prisma.user.create({
            data: { name, email, phone, cpf, password: hashed },
        })

        // Salvar lead e disparar webhook
        const lead = await prisma.lead.create({
            data: { userId: user.id, source: 'checkout' },
        })

        // Dispatch sem aguardar (não bloqueia resposta)
        dispatchLeadWebhook({
            ...lead,
            user: { name: user.name, email: user.email, phone: user.phone, cpf: user.cpf },
        }).catch(() => { })

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
