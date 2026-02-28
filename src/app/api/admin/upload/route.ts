import { NextRequest, NextResponse } from 'next/server'

const MAX_SIZE_MB = 5

export async function POST(req: NextRequest) {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })

    // Validar tamanho (máx 5MB)
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        return NextResponse.json({ error: `Arquivo muito grande. Máximo: ${MAX_SIZE_MB}MB.` }, { status: 400 })
    }

    // Validar tipo
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
        return NextResponse.json({ error: 'Tipo de arquivo não suportado. Use JPG, PNG, WEBP ou GIF.' }, { status: 400 })
    }

    // Converter para base64 data URL
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json({ url: dataUrl })
}

