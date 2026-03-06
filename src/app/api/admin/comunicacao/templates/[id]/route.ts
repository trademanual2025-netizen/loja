import { NextRequest, NextResponse } from 'next/server'
import { getAdminEmailFromRequest, unauthorizedResponse } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const email = getAdminEmailFromRequest(req)
    if (!email) return unauthorizedResponse()

    const { id } = await params
    const body = await req.json()

    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = body.name
    if (body.trigger !== undefined) data.trigger = body.trigger
    if (body.delayMinutes !== undefined) data.delayMinutes = Number(body.delayMinutes)
    if (body.message !== undefined) data.message = body.message
    if (body.active !== undefined) data.active = body.active

    const tpl = await prisma.whatsAppTemplate.update({ where: { id }, data })
    return NextResponse.json(tpl)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const email = getAdminEmailFromRequest(req)
    if (!email) return unauthorizedResponse()

    const { id } = await params
    await prisma.whatsAppTemplate.delete({ where: { id } })
    return NextResponse.json({ ok: true })
}
