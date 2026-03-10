import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { autoTranslateCategory } from '@/lib/translate'

export async function POST() {
    const categories = await prisma.category.findMany()
    let translated = 0

    for (const cat of categories) {
        if (cat.nameEn && cat.nameEs) continue

        const translations = await autoTranslateCategory({
            name: cat.name,
            nameEn: cat.nameEn,
            nameEs: cat.nameEs,
        })

        if (translations.nameEn || translations.nameEs) {
            await prisma.category.update({
                where: { id: cat.id },
                data: {
                    nameEn: translations.nameEn || cat.nameEn,
                    nameEs: translations.nameEs || cat.nameEs,
                },
            })
            translated++
        }
    }

    return NextResponse.json({ ok: true, translated, total: categories.length })
}
