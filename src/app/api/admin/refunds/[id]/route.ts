import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await verifyAdminToken(req)
    if (!admin) return unauthorizedResponse()

    const { id } = await params
    const { status, restoreStock } = await req.json()

    if (!['APPROVED', 'REJECTED'].includes(status)) {
        return NextResponse.json({ error: 'Status inválido.' }, { status: 400 })
    }

    const refund = await prisma.refundRequest.findUnique({
        where: { id },
        include: {
            order: {
                include: {
                    items: { select: { productId: true, variantId: true, quantity: true } },
                },
            },
        },
    })

    if (!refund) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 })

    await prisma.refundRequest.update({ where: { id }, data: { status } })

    if (status === 'APPROVED') {
        await prisma.order.update({
            where: { id: refund.orderId },
            data: { status: 'REFUNDED' },
        })

        if (restoreStock) {
            await prisma.$transaction(async (tx) => {
                for (const item of refund.order.items) {
                    if (item.variantId) {
                        await tx.productVariant.update({
                            where: { id: item.variantId },
                            data: { stock: { increment: item.quantity } },
                        })
                    } else {
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stock: { increment: item.quantity } },
                        })
                    }
                }
            })
        }
    } else {
        await prisma.order.update({
            where: { id: refund.orderId },
            data: { status: 'DELIVERED' },
        })
    }

    return NextResponse.json({ success: true })
}
