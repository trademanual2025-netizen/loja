import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')

    const where: Record<string, unknown> = { active: true }
    if (category) where.category = { slug: category }
    if (search) where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameEs: { contains: search, mode: 'insensitive' } },
    ]

    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'price_asc') orderBy = { price: 'asc' }
    else if (sort === 'price_desc') orderBy = { price: 'desc' }
    else if (sort === 'name_asc') orderBy = { name: 'asc' }
    else if (sort === 'name_desc') orderBy = { name: 'desc' }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            select: {
                id: true,
                name: true,
                nameEn: true,
                nameEs: true,
                slug: true,
                price: true,
                comparePrice: true,
                images: true,
                stock: true,
                variants: { select: { id: true } },
            },
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.product.count({ where }),
    ])

    const slimProducts = products.map(p => ({
        ...p,
        images: p.images.length > 0 ? [p.images[0]] : [],
    }))

    return NextResponse.json(
        { products: slimProducts, total, page, pages: Math.ceil(total / limit) },
        { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
    )
}
