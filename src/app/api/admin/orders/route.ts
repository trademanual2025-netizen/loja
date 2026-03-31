import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission, forbiddenResponse } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
    const perm = await requirePermission(req, 'orders')
    if (!perm) return forbiddenResponse()
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const status = searchParams.get('status')
    const limit = 20

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            select: {
                id: true,
                status: true,
                subtotal: true,
                discount: true,
                total: true,
                shippingCost: true,
                gateway: true,
                createdAt: true,
                trackingCode: true,
                trackingUrl: true,
                shippingNote: true,
                user: { select: { id: true, name: true, email: true } },
                items: {
                    select: {
                        id: true,
                        quantity: true,
                        price: true,
                        product: { select: { name: true, images: true, slug: true } },
                        variant: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.order.count({ where }),
    ])

    return NextResponse.json({ orders, total })
}
