import translate from 'google-translate-api-x'

export async function autoTranslateProduct(data: {
    name?: string
    nameEn?: string | null
    nameEs?: string | null
    description?: string | null
    descriptionEn?: string | null
    descriptionEs?: string | null
}): Promise<{
    nameEn: string | null
    nameEs: string | null
    descriptionEn: string | null
    descriptionEs: string | null
}> {
    const result = {
        nameEn: data.nameEn || null,
        nameEs: data.nameEs || null,
        descriptionEn: data.descriptionEn || null,
        descriptionEs: data.descriptionEs || null,
    }

    if (!data.name && !data.description) return result

    const tasks: Promise<void>[] = []

    if (data.name && !data.nameEn) {
        tasks.push(
            translateText(data.name, 'en').then(t => { result.nameEn = t })
        )
    }
    if (data.name && !data.nameEs) {
        tasks.push(
            translateText(data.name, 'es').then(t => { result.nameEs = t })
        )
    }
    if (data.description && !data.descriptionEn) {
        tasks.push(
            translateText(data.description, 'en').then(t => { result.descriptionEn = t })
        )
    }
    if (data.description && !data.descriptionEs) {
        tasks.push(
            translateText(data.description, 'es').then(t => { result.descriptionEs = t })
        )
    }

    await Promise.allSettled(tasks)
    return result
}

async function translateText(text: string, to: string): Promise<string | null> {
    try {
        const res = await translate(text, { from: 'pt', to })
        return res.text || null
    } catch (err) {
        console.error(`Translation failed (pt -> ${to}):`, err)
        return null
    }
}
