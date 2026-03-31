import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, forbiddenResponse } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const perm = await requirePermission(req, 'reembolsos')
    if (!perm) return forbiddenResponse()

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
