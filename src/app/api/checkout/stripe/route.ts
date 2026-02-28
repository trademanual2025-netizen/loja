import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verify } from 'jsonwebtoken'
import { getSetting, SETTINGS_KEYS } from '@/lib/config'
import Stripe from 'stripe'

const JWT_SECRET = process.env.JWT_SECRET || 'loja-secret-change-in-production'

async function getUserFromRequest(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return null
    try {
        return verify(token, JWT_SECRET) as { id: string; email: string; name: string }
    } catch {
        return null
    }
}

// POST /api/checkout/stripe — cria PaymentIntent
export async function POST(req: NextRequest) {
    const session = await getUserFromRequest(req)
    if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

    const secretKey = await getSetting(SETTINGS_KEYS.STRIPE_SECRET_KEY)
    if (!secretKey) return NextResponse.json({ error: 'Stripe não configurado.' }, { status: 400 })

    const { items, shippingCost, address } = await req.json()

    const user = await prisma.user.findUnique({ where: { id: session.id } })
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

    const subtotal = items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0)
    const total = subtotal + shippingCost

    try {
        const stripe = new Stripe(secretKey)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100), // centavos
            currency: 'brl',
            metadata: { userId: session.id },
            automatic_payment_methods: { enabled: true },
        })

        // Criar pedido no banco como PENDING (O Webhook mudará para PAID)
        const order = await prisma.order.create({
            data: {
                userId: user.id,
                gateway: 'stripe',
                gatewayId: paymentIntent.id,
                status: 'PENDING',
                subtotal,
                shippingCost,
                total,
                ...address,
                items: {
                    create: items.map((i: { id: string; price: number; quantity: number; variantId?: string }) => ({
                        productId: i.id,
                        variantId: i.variantId || null,
                        price: i.price,
                        quantity: i.quantity,
                    })),
                },
            },
        })

        return NextResponse.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id, orderId: order.id })
    } catch (err: unknown) {
        console.error(err)
        return NextResponse.json({ error: 'Erro ao criar PaymentIntent.' }, { status: 500 })
    }
}
