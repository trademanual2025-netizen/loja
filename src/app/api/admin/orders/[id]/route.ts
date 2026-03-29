import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { increaseStock } from '@/lib/inventory'
import { triggerWhatsApp, WA_TRIGGERS } from '@/lib/whatsapp'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await req.json()
        const { status, trackingCode, trackingUrl, shippingNote } = body

        const data: Record<string, unknown> = {}

        const existing = await prisma.order.findUnique({
            where: { id },
            select: {
                status: true, gatewayData: true, deliveredAt: true,
                trackingCode: true, total: true, userId: true,
                user: { select: { name: true, phone: true } },
                items: { include: { product: { select: { name: true } } } },
            },
        })

        if (status !== undefined) {
            data.status = status

            if (status === 'DELIVERED' && !existing?.deliveredAt) {
                data.deliveredAt = new Date()
            }

            if (status === 'CANCELLED' && existing?.status === 'PENDING') {
                let gw: Record<string, unknown> = {}
                try { if (existing.gatewayData) gw = JSON.parse(existing.gatewayData) } catch {}
                if (gw.stockReserved === true) {
                    increaseStock(existing.items).catch((err: Error) => {
                        console.error('[Admin Cancel] Erro ao restaurar estoque:', err)
                    })
                }
            }
        }

        if (trackingCode !== undefined) data.trackingCode = trackingCode
        if (trackingUrl !== undefined) data.trackingUrl = trackingUrl
        if (shippingNote !== undefined) data.shippingNote = shippingNote

        const order = await prisma.order.update({ where: { id }, data })

        const phone = existing?.user?.phone
        const nome = existing?.user?.name
        const pedido = id.slice(-8).toUpperCase()
        const total = existing?.total?.toFixed(2).replace('.', ',')
        const produto = existing?.items?.[0]?.product?.name

        if (phone) {
            const rastreio = trackingCode || existing?.trackingCode || undefined

            if (status === 'DELIVERED') {
                triggerWhatsApp(WA_TRIGGERS.ORDER_DELIVERED, {
                    phone, nome, pedido, total, produto, orderId: id, userId: existing?.userId,
                }).catch(() => {})
            } else if (status === 'CANCELLED') {
                triggerWhatsApp(WA_TRIGGERS.ORDER_CANCELLED, {
                    phone, nome, pedido, total, produto, orderId: id, userId: existing?.userId,
                }).catch(() => {})
            }

            if (trackingCode && !existing?.trackingCode) {
                triggerWhatsApp(WA_TRIGGERS.ORDER_SHIPPED, {
                    phone, nome, pedido, total, produto, rastreio, orderId: id, userId: existing?.userId,
                }).catch(() => {})
            }
        }

        return NextResponse.json(order)
    } catch (error: any) {
        console.error('Error in PATCH /api/admin/orders/[id]:', error)
        return NextResponse.json({ error: error.message || 'Erro ao atualizar pedido' }, { status: 500 })
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        const order = await prisma.order.findUnique({
            where: { id },
            select: { id: true },
        })

        if (!order) {
            return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
        }

        await prisma.$transaction([
            prisma.refundRequest.deleteMany({ where: { orderId: id } }),
            prisma.orderItem.deleteMany({ where: { orderId: id } }),
            prisma.webhookLog.deleteMany({ where: { orderId: id } }),
            prisma.whatsAppLog.deleteMany({ where: { orderId: id } }),
            prisma.whatsAppQueue.deleteMany({ where: { orderId: id } }),
            prisma.order.delete({ where: { id } }),
        ])

        return NextResponse.json({ ok: true })
    } catch (error: any) {
        console.error('Error in DELETE /api/admin/orders/[id]:', error)
        return NextResponse.json({ error: error.message || 'Erro ao excluir pedido' }, { status: 500 })
    }
}
