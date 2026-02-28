import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { dispatchBuyerWebhook } from '@/lib/webhooks'
import { getSetting, SETTINGS_KEYS } from '@/lib/config'
import Stripe from 'stripe'
import { decreaseStock } from '@/lib/inventory'

export async function POST(req: NextRequest) {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature') || ''

    const secretKey = await getSetting(SETTINGS_KEYS.STRIPE_SECRET_KEY)
    const webhookSecret = await getSetting(SETTINGS_KEYS.STRIPE_WEBHOOK_SECRET)

    if (!secretKey || !webhookSecret) {
        return NextResponse.json({ error: 'Stripe não configurado' }, { status: 400 })
    }

    const stripe = new Stripe(secretKey)
    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err) {
        return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 })
    }

    if (event.type === 'payment_intent.succeeded') {
        const pi = event.data.object as Stripe.PaymentIntent
        const order = await prisma.order.findFirst({
            where: { gatewayId: pi.id },
            include: { user: true, items: { include: { product: true } } },
        })
        if (order && order.status !== 'PAID') {
            const updated = await prisma.order.update({
                where: { id: order.id },
                data: { status: 'PAID' },
                include: { user: true, items: { include: { product: true } } },
            })
            decreaseStock(updated.items).catch(() => { })
            dispatchBuyerWebhook(updated).catch(() => { })
        }
    }

    return NextResponse.json({ received: true })
}
