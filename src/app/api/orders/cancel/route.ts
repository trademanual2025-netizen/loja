import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: Request) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

    const { orderId } = await req.json()
    if (!orderId) return NextResponse.json({ error: 'ID do pedido é obrigatório.' }, { status: 400 })

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            id: true,
            userId: true,
            status: true,
            gatewayData: true,
            items: {
                select: {
                    productId: true,
                    variantId: true,
                    quantity: true,
                    price: true,
                    product: { select: { name: true, slug: true, images: true } },
                    variant: { select: { name: true } },
                },
            },
        },
    })

    if (!order) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 })
    if (order.userId !== user.id) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })
    if (order.status !== 'PENDING') return NextResponse.json({ error: 'Apenas pedidos pendentes podem ser cancelados.' }, { status: 400 })

    let existingGw: Record<string, unknown> = {}
    try { if (order.gatewayData) existingGw = JSON.parse(order.gatewayData) } catch {}

    await prisma.order.update({
        where: { id: orderId },
        data: {
            status: 'CANCELLED',
            gatewayData: JSON.stringify({
                ...existingGw,
                cancelledReason: 'user_changed_payment_method',
                cancelledAt: new Date().toISOString(),
            }),
        },
    })

    const cartItems = order.items.map(item => ({
        id: item.productId,
        name: item.product.name,
        slug: item.product.slug,
        price: item.price,
        image: item.product.images?.[0] || '',
        quantity: item.quantity,
        variantId: item.variantId || undefined,
        variantName: item.variant?.name || undefined,
    }))

    return NextResponse.json({ success: true, cartItems })
}
