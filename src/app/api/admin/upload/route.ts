import { NextRequest, NextResponse } from 'next/server'
import { uploadToB2, isB2Configured } from '@/lib/b2'

const MAX_SIZE_MB = 5

export async function POST(req: NextRequest) {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        return NextResponse.json({ error: `Arquivo muito grande. Máximo: ${MAX_SIZE_MB}MB.` }, { status: 400 })
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
        return NextResponse.json({ error: 'Tipo de arquivo não suportado. Use JPG, PNG, WEBP ou GIF.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    if (isB2Configured()) {
        try {
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
            const url = await uploadToB2(buffer, safeName, file.type)
            if (url) return NextResponse.json({ url })
        } catch (err) {
            console.error('[upload] B2 upload failed, falling back to base64:', err)
        }
    }

    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`
    return NextResponse.json({ url: dataUrl })
}
