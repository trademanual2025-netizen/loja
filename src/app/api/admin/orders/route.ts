import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const status = searchParams.get('status')
    const limit = 20

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            include: { user: true, items: { include: { product: true, variant: true } } },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.order.count({ where }),
    ])

    return NextResponse.json({ orders, total })
}
