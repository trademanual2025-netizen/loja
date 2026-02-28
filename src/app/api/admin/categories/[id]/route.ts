import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { name, slug } = await req.json()
    if (!name) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })

    const updateData: Record<string, string> = { name }
    if (slug) updateData.slug = slug

    try {
        const category = await prisma.category.update({ where: { id }, data: updateData })
        return NextResponse.json(category)
    } catch {
        return NextResponse.json({ error: 'Categoria não encontrada ou slug já em uso.' }, { status: 400 })
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    // Move produtos para sem categoria antes de deletar
    await prisma.product.updateMany({ where: { categoryId: id }, data: { categoryId: null } })
    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ ok: true })
}
