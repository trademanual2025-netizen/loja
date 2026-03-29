import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const now = new Date()
        const count = await prisma.coupon.count({
            where: {
                active: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: now } },
                ],
            },
        })

        return NextResponse.json({ hasActive: count > 0 })
    } catch {
        return NextResponse.json({ hasActive: false })
    }
}
