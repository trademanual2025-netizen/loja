import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { increaseStock } from '@/lib/inventory'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await req.json()
        const { status, trackingCode, trackingUrl, shippingNote } = body

        const data: Record<string, unknown> = {}

        if (status !== undefined) {
            data.status = status

            if (status === 'DELIVERED') {
                const existing = await prisma.order.findUnique({ where: { id }, select: { deliveredAt: true } })
                if (!existing?.deliveredAt) data.deliveredAt = new Date()
            }

            if (status === 'CANCELLED') {
                // Se o pedido estava PENDING e tinha estoque reservado, restaura
                const existing = await prisma.order.findUnique({
                    where: { id },
                    select: { status: true, gatewayData: true, items: true },
                })
                if (existing?.status === 'PENDING') {
                    let gw: Record<string, unknown> = {}
                    try { if (existing.gatewayData) gw = JSON.parse(existing.gatewayData) } catch {}
                    if (gw.stockReserved === true) {
                        increaseStock(existing.items).catch((err: Error) => {
                            console.error('[Admin Cancel] Erro ao restaurar estoque:', err)
                        })
                    }
                }
            }
        }

        if (trackingCode !== undefined) data.trackingCode = trackingCode
        if (trackingUrl !== undefined) data.trackingUrl = trackingUrl
        if (shippingNote !== undefined) data.shippingNote = shippingNote

        const order = await prisma.order.update({ where: { id }, data })

        return NextResponse.json(order)
    } catch (error: any) {
        console.error('Error in PATCH /api/admin/orders/[id]:', error)
        return NextResponse.json({ error: error.message || 'Erro ao atualizar pedido' }, { status: 500 })
    }
}
