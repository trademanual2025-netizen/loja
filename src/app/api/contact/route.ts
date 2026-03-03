import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const { name, email, subject, message } = await req.json()

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 })
        }

        console.log('[CONTATO]', { name, email, subject, message, at: new Date().toISOString() })

        return NextResponse.json({ ok: true })
    } catch {
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
    }
}
