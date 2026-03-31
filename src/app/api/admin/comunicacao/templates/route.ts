import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, forbiddenResponse } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { DEFAULT_TEMPLATES } from '@/lib/whatsapp'

export async function GET(req: NextRequest) {
    const perm = await requirePermission(req, 'comunicacao')
    if (!perm) return forbiddenResponse()

    let templates = await prisma.whatsAppTemplate.findMany({
        orderBy: [{ trigger: 'asc' }, { createdAt: 'asc' }],
    })

    if (templates.length === 0) {
        await prisma.whatsAppTemplate.createMany({ data: DEFAULT_TEMPLATES })
        templates = await prisma.whatsAppTemplate.findMany({
            orderBy: [{ trigger: 'asc' }, { createdAt: 'asc' }],
        })
    }

    return NextResponse.json(templates)
}

export async function POST(req: NextRequest) {
    const email = getAdminEmailFromRequest(req)
    if (!email) return unauthorizedResponse()

    const body = await req.json()
    const { name, trigger, delayMinutes, message, active } = body

    if (!name?.trim() || !trigger || !message?.trim()) {
        return NextResponse.json({ error: 'Nome, gatilho e mensagem são obrigatórios.' }, { status: 400 })
    }

    const tpl = await prisma.whatsAppTemplate.create({
        data: {
            name: name.trim(),
            trigger,
            delayMinutes: Number(delayMinutes) || 0,
            message: message.trim(),
            active: active !== false,
        },
    })

    return NextResponse.json(tpl)
}
