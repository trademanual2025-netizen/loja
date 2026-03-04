import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const admin = await verifyAdminToken(req)
    if (!admin) return unauthorizedResponse()

    const refunds = await prisma.refundRequest.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            messages: { orderBy: { createdAt: 'asc' } },
            order: {
                select: {
                    id: true,
                    total: true,
                    deliveredAt: true,
                    user: { select: { name: true, email: true } },
                    items: { select: { quantity: true, price: true, product: { select: { name: true } } } },
                },
            },
        },
    })

    return NextResponse.json(refunds)
}
