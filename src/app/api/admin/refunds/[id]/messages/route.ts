import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const admin = await verifyAdminToken(req)
    if (!admin) return unauthorizedResponse()

    const { id } = await params
    const { content } = await req.json()

    if (!content?.trim()) return NextResponse.json({ error: 'Mensagem vazia.' }, { status: 400 })

    const refund = await prisma.refundRequest.findUnique({ where: { id } })
    if (!refund) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 })

    const msg = await prisma.refundMessage.create({
        data: { refundRequestId: id, authorType: 'ADMIN', content: content.trim() },
    })

    return NextResponse.json(msg, { status: 201 })
}
