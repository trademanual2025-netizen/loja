import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ items: [] })

    try {
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { cartData: true },
        })
        const items = dbUser?.cartData ? JSON.parse(dbUser.cartData) : []
        return NextResponse.json({ items })
    } catch {
        return NextResponse.json({ items: [] })
    }
}

export async function POST(req: NextRequest) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    try {
        const { items } = await req.json()

        const cartItems = Array.isArray(items) ? items : []

        const cartData = cartItems.length > 0
            ? JSON.stringify(cartItems.map((i: any) => ({
                id: i.id,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
                image: i.image || null,
                slug: i.slug || i.id,
                variantId: i.variantId || null,
                variantName: i.variantName || null,
            })))
            : null

        await prisma.user.update({
            where: { id: user.id },
            data: { cartData },
        })

        await prisma.stockReservation.deleteMany({ where: { userId: user.id } })

        if (cartItems.length > 0) {
            const productIds = [...new Set(cartItems.map((i: any) => i.id as string))]
            const products = await prisma.product.findMany({
                where: { id: { in: productIds } },
                select: { id: true, reserveMinutes: true },
            })
            const reserveMap = Object.fromEntries(products.map(p => [p.id, p.reserveMinutes]))

            for (const item of cartItems) {
                const minutes = reserveMap[item.id] ?? 30
                const expiresAt = new Date(Date.now() + minutes * 60 * 1000)
                await prisma.stockReservation.create({
                    data: {
                        userId: user.id,
                        productId: item.id,
                        variantId: item.variantId || null,
                        quantity: item.quantity,
                        expiresAt,
                    },
                })
            }
        }

        return NextResponse.json({ ok: true })
    } catch {
        return NextResponse.json({ error: 'Erro ao sincronizar carrinho' }, { status: 500 })
    }
}
