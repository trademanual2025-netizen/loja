import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    const where: Record<string, unknown> = { active: true }
    if (category) where.category = { slug: category }
    if (search) where.name = { contains: search, mode: 'insensitive' }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: {
                category: true,
                options: true,
                variants: true
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.product.count({ where }),
    ])

    return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) })
}
