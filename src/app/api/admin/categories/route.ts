import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } },
    })
    return NextResponse.json({ categories })
}

export async function POST(req: NextRequest) {
    const { name, slug } = await req.json()
    if (!name) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })

    const generatedSlug = slug || name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const existing = await prisma.category.findUnique({ where: { slug: generatedSlug } })
    if (existing) return NextResponse.json({ error: 'Já existe uma categoria com esse slug.' }, { status: 409 })

    const category = await prisma.category.create({ data: { name, slug: generatedSlug } })
    return NextResponse.json(category)
}
