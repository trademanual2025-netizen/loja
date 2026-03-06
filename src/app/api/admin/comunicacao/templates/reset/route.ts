import { NextRequest, NextResponse } from 'next/server'
import { getAdminEmailFromRequest, unauthorizedResponse } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { DEFAULT_TEMPLATES } from '@/lib/whatsapp'

export async function POST(req: NextRequest) {
    const email = getAdminEmailFromRequest(req)
    if (!email) return unauthorizedResponse()

    await prisma.whatsAppTemplate.deleteMany({})
    await prisma.whatsAppTemplate.createMany({ data: DEFAULT_TEMPLATES })

    const templates = await prisma.whatsAppTemplate.findMany({
        orderBy: [{ trigger: 'asc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json(templates)
}
