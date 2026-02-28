import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params
    const product = await prisma.product.findUnique({
        where: { slug },
        include: { category: true },
    })

    if (!product || !product.active) {
        return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 })
    }

    return NextResponse.json(product)
}
