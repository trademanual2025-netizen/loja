import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/products — lista todos os produtos (com inativos)
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const where = search ? { name: { contains: search, mode: 'insensitive' as const } } : {}

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: { category: true },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.product.count({ where }),
    ])

    return NextResponse.json({ products, total })
}

// POST /api/admin/products — cria produto
export async function POST(req: NextRequest) {
    const body = await req.json()
    const { name, description, price, comparePrice, stock, images, bannerUrl, active, categoryId, options, variants, weight, height, width, length } = body

    if (!name || price === undefined) {
        return NextResponse.json({ error: 'Nome e preço são obrigatórios.' }, { status: 400 })
    }

    const numericPrice = parseFloat(String(price).replace(',', '.'))
    if (isNaN(numericPrice) || numericPrice < 0) {
        return NextResponse.json({ error: 'Preço deve ser um valor válido e não negativo.' }, { status: 400 })
    }

    const numericStock = parseInt(String(stock))
    if (!isNaN(numericStock) && numericStock < 0) {
        return NextResponse.json({ error: 'Estoque não pode ser negativo.' }, { status: 400 })
    }

    const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        + '-' + Date.now()

    const safeParseFloat = (val: any) => {
        const parsed = parseFloat(String(val).replace(',', '.'))
        return isNaN(parsed) ? null : parsed
    }
    const safeParseInt = (val: any) => {
        const parsed = parseInt(String(val))
        return isNaN(parsed) ? 0 : parsed
    }

    const product = await prisma.product.create({
        data: {
            name, slug, description, price: safeParseFloat(price) || 0,
            comparePrice: safeParseFloat(comparePrice),
            stock: safeParseInt(stock), images: images || [],
            bannerUrl: bannerUrl || null, active: active !== false,
            categoryId: categoryId || null,
            weight: safeParseFloat(weight),
            height: safeParseFloat(height),
            width: safeParseFloat(width),
            length: safeParseFloat(length),
            options: {
                create: options?.filter((o: any) => o.name?.trim()).map((o: any) => ({
                    name: o.name,
                    values: o.values
                })) || []
            },
            variants: {
                create: variants?.map((v: any) => ({
                    name: v.name,
                    price: safeParseFloat(v.price),
                    stock: safeParseInt(v.stock),
                    sku: v.sku || null
                })) || []
            }
        },
        include: { options: true, variants: true }
    })

    return NextResponse.json(product)
}
