import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await verifyAdminToken(req)
    if (!admin) return unauthorizedResponse()

    const { id } = await params
    const { status } = await req.json()

    if (!['APPROVED', 'REJECTED'].includes(status)) {
        return NextResponse.json({ error: 'Status inválido.' }, { status: 400 })
    }

    const refund = await prisma.refundRequest.update({
        where: { id },
        data: { status },
    })

    if (status === 'APPROVED') {
        await prisma.order.update({
            where: { id: refund.orderId },
            data: { status: 'REFUNDED' },
        })
    } else {
        await prisma.order.update({
            where: { id: refund.orderId },
            data: { status: 'DELIVERED' },
        })
    }

    return NextResponse.json(refund)
}
