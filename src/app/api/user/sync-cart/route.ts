import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function resolveCartItems(items: any[]) {
    if (!items.length) return { valid: [], changed: false }
    const productIds = [...new Set(items.map((i: any) => i.id as string))]
    const products = await prisma.product.findMany({
        where: { id: { in: productIds }, active: true },
        select: {
            id: true,
            name: true,
            price: true,
            slug: true,
            images: true,
            variants: { select: { id: true, price: true } },
        },
    })
    const productMap = new Map(products.map(p => [p.id, p]))

    let changed = false
    const valid: any[] = []

    for (const item of items) {
        const product = productMap.get(item.id)
        if (!product) { changed = true; continue }

        let currentPrice = product.price
        if (item.variantId) {
            const variant = product.variants.find(v => v.id === item.variantId)
            if (!variant) { changed = true; continue }
            if (variant.price != null) currentPrice = variant.price
        }

        if (currentPrice !== item.price) changed = true
        const currentImage = item.image || (Array.isArray(product.images) ? product.images[0] : null) || null
        valid.push({ ...item, price: currentPrice, image: currentImage })
    }

    if (valid.length !== items.length) changed = true
    return { valid, changed }
}

export async function GET() {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ items: [] })

    try {
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { cartData: true },
        })
        const raw = dbUser?.cartData ? JSON.parse(dbUser.cartData) : []
        const { valid, changed } = await resolveCartItems(raw)

        if (changed) {
            const cartData = valid.length > 0 ? JSON.stringify(valid) : null
            await prisma.user.update({ where: { id: user.id }, data: { cartData } })
        }

        return NextResponse.json({ items: valid })
    } catch {
        return NextResponse.json({ items: [] })
    }
}

export async function POST(req: NextRequest) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    try {
        const { items } = await req.json()
        const rawItems = Array.isArray(items) ? items : []
        const { valid: cartItems } = await resolveCartItems(rawItems)

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

        return NextResponse.json({ ok: true, filtered: cartItems.length !== rawItems.length })
    } catch {
        return NextResponse.json({ error: 'Erro ao sincronizar carrinho' }, { status: 500 })
    }
}
