import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
