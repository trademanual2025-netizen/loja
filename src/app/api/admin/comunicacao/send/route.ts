import { NextRequest, NextResponse } from 'next/server'
import { getAdminEmailFromRequest, unauthorizedResponse } from '@/lib/admin-auth'
import { sendWhatsAppRaw, formatPhone } from '@/lib/whatsapp'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    const email = getAdminEmailFromRequest(req)
    if (!email) return unauthorizedResponse()

    const { phone, message, orderId, userId } = await req.json()

    if (!phone?.trim() || !message?.trim()) {
        return NextResponse.json({ error: 'Telefone e mensagem são obrigatórios.' }, { status: 400 })
    }

    const result = await sendWhatsAppRaw(phone.trim(), message.trim())

    await prisma.whatsAppLog.create({
        data: {
            phone: formatPhone(phone.trim()),
            trigger: 'manual',
            message: message.trim(),
            status: result.ok ? 'sent' : 'failed',
            error: result.error,
            orderId: orderId || null,
            userId: userId || null,
        },
    })

    if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
}
