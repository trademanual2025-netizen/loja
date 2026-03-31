import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, forbiddenResponse } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const perm = await requirePermission(req, 'comunicacao')
    if (!perm) return forbiddenResponse()

    const url = new URL(req.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = 50

    const [logs, total] = await Promise.all([
        prisma.whatsAppLog.findMany({
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.whatsAppLog.count(),
    ])

    return NextResponse.json({ logs, total, page, pages: Math.ceil(total / limit) })
}
