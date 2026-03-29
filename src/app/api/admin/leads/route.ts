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
                        orders: { select: { id: true, status: true } },
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.lead.count(),
    ])

    const allCartItems: any[] = []
    const leadsRaw = leads.map(lead => {
        let cartItems: any[] = []
        try {
            if (lead.user.cartData) cartItems = JSON.parse(lead.user.cartData)
        } catch {}
        allCartItems.push(...cartItems)
        return { lead, cartItems }
    })

    const productIds = [...new Set(allCartItems.map((i: any) => i.id as string))]
    const products = productIds.length > 0
        ? await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, price: true, active: true, variants: { select: { id: true, price: true } } },
        })
        : []
    const productMap = new Map(products.map(p => [p.id, p]))

    const leadsWithCart = leadsRaw.map(({ lead, cartItems }) => {
        const resolvedItems = cartItems
            .map((item: any) => {
                const product = productMap.get(item.id)
                if (!product || !product.active) return null
                let currentPrice = product.price
                if (item.variantId) {
                    const variant = product.variants.find(v => v.id === item.variantId)
                    if (!variant) return null
                    if (variant.price != null) currentPrice = variant.price
                }
                return { ...item, price: currentPrice }
            })
            .filter(Boolean)

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
                cartItems: resolvedItems,
            }
        }
    })

    return NextResponse.json({ leads: leadsWithCart, total })
}
