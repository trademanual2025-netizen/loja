import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { orderId } = await params
    const { content } = await req.json()

    if (!content?.trim()) return NextResponse.json({ error: 'Mensagem vazia.' }, { status: 400 })

    const refund = await prisma.refundRequest.findUnique({ where: { orderId } })
    if (!refund || refund.userId !== user.id) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 })

    const msg = await prisma.refundMessage.create({
        data: { refundRequestId: refund.id, authorType: 'USER', content: content.trim() },
    })

    return NextResponse.json(msg, { status: 201 })
}
