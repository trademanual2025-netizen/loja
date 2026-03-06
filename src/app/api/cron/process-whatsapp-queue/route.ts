import { NextRequest, NextResponse } from 'next/server'
import { processWhatsAppQueue } from '@/lib/whatsapp'

export async function GET(req: NextRequest) {
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
        const authHeader = req.headers.get('authorization')
        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
        }
    }

    const result = await processWhatsAppQueue()

    return NextResponse.json({
        ok: true,
        ...result,
        at: new Date().toISOString(),
    })
}
