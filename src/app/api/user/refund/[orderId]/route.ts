import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const REFUND_WINDOW_DAYS = 7

export async function GET(_req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { orderId } = await params

    const refund = await prisma.refundRequest.findUnique({
        where: { orderId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
    })

    if (!refund || refund.userId !== user.id) return NextResponse.json(null)

    return NextResponse.json(refund)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { orderId } = await params
    const { reason } = await req.json()

    if (!reason?.trim()) return NextResponse.json({ error: 'Motivo obrigatório.' }, { status: 400 })

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { id: true, userId: true, status: true, deliveredAt: true },
    })

    if (!order || order.userId !== user.id) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 })
    if (order.status !== 'DELIVERED') return NextResponse.json({ error: 'Só é possível solicitar reembolso de pedidos entregues.' }, { status: 400 })

    if (order.deliveredAt) {
        const diffMs = Date.now() - new Date(order.deliveredAt).getTime()
        const diffDays = diffMs / (1000 * 60 * 60 * 24)
        if (diffDays > REFUND_WINDOW_DAYS) {
            return NextResponse.json({ error: `Prazo de ${REFUND_WINDOW_DAYS} dias para solicitar reembolso encerrado.` }, { status: 400 })
        }
    }

    const existing = await prisma.refundRequest.findUnique({ where: { orderId } })
    if (existing) return NextResponse.json({ error: 'Solicitação de reembolso já existe para este pedido.' }, { status: 409 })

    const refund = await prisma.refundRequest.create({
        data: { orderId, userId: user.id, reason: reason.trim(), status: 'PENDING' },
    })

    await prisma.order.update({
        where: { id: orderId },
        data: { status: 'REFUND_REQUESTED' },
    })

    return NextResponse.json(refund, { status: 201 })
}
