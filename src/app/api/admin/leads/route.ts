import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20

    const [leads, total] = await Promise.all([
        prisma.lead.findMany({
            include: {
                user: {
                    include: {
                        orders: { select: { id: true }, take: 1 },
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.lead.count(),
    ])

    const leadsWithCart = leads.map(lead => {
        let cartItems: any[] = []
        try {
            if (lead.user.cartData) cartItems = JSON.parse(lead.user.cartData)
        } catch {}

        return {
            id: lead.id,
            source: lead.source,
            createdAt: lead.createdAt,
            user: {
                name: lead.user.name,
                email: lead.user.email,
                phone: lead.user.phone,
                cpf: lead.user.cpf,
                orders: lead.user.orders,
                cartItems,
            }
        }
    })

    return NextResponse.json({ leads: leadsWithCart, total })
}
