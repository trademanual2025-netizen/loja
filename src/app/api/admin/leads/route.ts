import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20

    const [leads, total] = await Promise.all([
        prisma.lead.findMany({
            include: { user: true },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.lead.count(),
    ])

    return NextResponse.json({ leads, total })
}
