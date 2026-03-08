import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { autoTranslateProduct } from '@/lib/translate'

export async function POST() {
    try {
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { nameEn: null },
                    { nameEs: null },
                    { descriptionEn: null, description: { not: null } },
                    { descriptionEs: null, description: { not: null } },
                ]
            },
            select: { id: true, name: true, nameEn: true, nameEs: true, description: true, descriptionEn: true, descriptionEs: true }
        })

        let translated = 0
        for (const p of products) {
            const translations = await autoTranslateProduct({
                name: p.name,
                nameEn: p.nameEn,
                nameEs: p.nameEs,
                description: p.description,
                descriptionEn: p.descriptionEn,
                descriptionEs: p.descriptionEs,
            })

            await prisma.product.update({
                where: { id: p.id },
                data: {
                    nameEn: translations.nameEn,
                    nameEs: translations.nameEs,
                    descriptionEn: translations.descriptionEn,
                    descriptionEs: translations.descriptionEs,
                }
            })
            translated++
        }

        return NextResponse.json({ ok: true, translated, total: products.length })
    } catch (error: any) {
        console.error('Translate all error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
