import { NextRequest, NextResponse } from 'next/server'
import { getAdminEmailFromRequest, unauthorizedResponse } from '@/lib/admin-auth'
import { processWhatsAppQueue } from '@/lib/whatsapp'

export async function POST(req: NextRequest) {
    const email = getAdminEmailFromRequest(req)
    if (!email) return unauthorizedResponse()

    const result = await processWhatsAppQueue()
    return NextResponse.json({ ok: true, ...result })
}
