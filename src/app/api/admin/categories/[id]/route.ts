import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { autoTranslateCategory } from '@/lib/translate'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { name, slug } = await req.json()
    if (!name) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })

    const existing = await prisma.category.findUnique({ where: { id }, select: { name: true, nameEn: true, nameEs: true } })
    const nameChanged = name !== existing?.name

    const translations = await autoTranslateCategory({
        name,
        nameEn: nameChanged ? null : existing?.nameEn,
        nameEs: nameChanged ? null : existing?.nameEs,
    })

    const updateData: Record<string, string | null> = {
        name,
        nameEn: translations.nameEn || existing?.nameEn || null,
        nameEs: translations.nameEs || existing?.nameEs || null,
    }
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
    await prisma.product.updateMany({ where: { categoryId: id }, data: { categoryId: null } })
    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ ok: true })
}
