import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/products/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const product = await prisma.product.findUnique({
            where: { id }
        })

        if (!product) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 })

        // Fetch relations manually to avoid 'include' errors if client is out of sync
        const [category, options, variants] = await Promise.all([
            product.categoryId ? prisma.category.findUnique({ where: { id: product.categoryId } }) : Promise.resolve(null),
            prisma.productOption.findMany({ where: { productId: id } }),
            prisma.productVariant.findMany({ where: { productId: id } })
        ])

        return NextResponse.json({
            ...product,
            category,
            options,
            variants
        })
    } catch (error: any) {
        console.error('Error in GET /api/admin/products/[id]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PATCH /api/admin/products/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await req.json()
        const { name, nameEn, nameEs, description, descriptionEn, descriptionEs, price, comparePrice, stock, images, bannerUrl, active, categoryId, options, variants, weight, height, width, length, reserveMinutes } = body

        const safeParseFloat = (val: any) => {
            if (val === undefined || val === null || val === '') return null
            const parsed = parseFloat(String(val).replace(',', '.'))
            return isNaN(parsed) ? null : parsed
        }
        const safeParseInt = (val: any) => {
            if (val === undefined || val === null || val === '') return 0
            const parsed = parseInt(String(val))
            return isNaN(parsed) ? 0 : parsed
        }

        const validOptions = (options || []).filter((o: any) => o.name?.trim())

        // 1. Update basic product info
        const product = await prisma.product.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(nameEn !== undefined && { nameEn: nameEn || null }),
                ...(nameEs !== undefined && { nameEs: nameEs || null }),
                ...(description !== undefined && { description }),
                ...(descriptionEn !== undefined && { descriptionEn: descriptionEn || null }),
                ...(descriptionEs !== undefined && { descriptionEs: descriptionEs || null }),
                ...(price !== undefined && { price: safeParseFloat(price) || 0 }),
                ...(comparePrice !== undefined && { comparePrice: safeParseFloat(comparePrice) }),
                ...(stock !== undefined && { stock: safeParseInt(stock) }),
                ...(images !== undefined && { images }),
                ...(bannerUrl !== undefined && { bannerUrl }),
                ...(active !== undefined && { active }),
                ...(categoryId !== undefined && {
                    category: categoryId ? { connect: { id: categoryId } } : { disconnect: true }
                }),
                ...(weight !== undefined && { weight: safeParseFloat(weight) }),
                ...(height !== undefined && { height: safeParseFloat(height) }),
                ...(width !== undefined && { width: safeParseFloat(width) }),
                ...(length !== undefined && { length: safeParseFloat(length) }),
                ...(reserveMinutes !== undefined && { reserveMinutes: Math.max(1, parseInt(String(reserveMinutes)) || 30) }),
            }
        })

        // 2. Update options separately (Delete then Create)
        if (options !== undefined) {
            await prisma.productOption.deleteMany({ where: { productId: id } })
            if (validOptions.length > 0) {
                // Using a loop or separate creates if createMany has issues
                for (const opt of validOptions) {
                    await prisma.productOption.create({
                        data: {
                            productId: id,
                            name: opt.name,
                            values: opt.values
                        }
                    })
                }
            }
        }

        // 3. Update variants separately
        if (variants !== undefined) {
            await prisma.productVariant.deleteMany({ where: { productId: id } })
            if (variants.length > 0) {
                for (const variant of variants) {
                    await prisma.productVariant.create({
                        data: {
                            productId: id,
                            name: variant.name,
                            price: safeParseFloat(variant.price),
                            stock: safeParseInt(variant.stock),
                            sku: variant.sku || null,
                            image: variant.image || null
                        }
                    })
                }
            }
        }

        return NextResponse.json(product)
    } catch (error: any) {
        console.error('Error in PATCH /api/admin/products/[id]:', error)
        return NextResponse.json({
            error: error.message || 'Erro interno ao atualizar produto',
            details: error instanceof Error ? error.stack : undefined
        }, { status: 500 })
    }
}

// DELETE /api/admin/products/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ ok: true })
}
