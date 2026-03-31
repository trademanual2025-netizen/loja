import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, forbiddenResponse } from '@/lib/admin-auth'
import { processWhatsAppQueue } from '@/lib/whatsapp'

export async function POST(req: NextRequest) {
    const perm = await requirePermission(req, 'comunicacao')
    if (!perm) return forbiddenResponse()

    const result = await processWhatsAppQueue()
    return NextResponse.json({ ok: true, ...result })
}
