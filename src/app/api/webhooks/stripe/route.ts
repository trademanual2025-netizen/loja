import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { dispatchBuyerWebhook } from '@/lib/webhooks'
import { getSetting, SETTINGS_KEYS } from '@/lib/config'
import Stripe from 'stripe'
import { decreaseStock, increaseStock } from '@/lib/inventory'

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
        console.error('[Stripe Webhook] Assinatura inválida:', err)
        return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 })
    }

    if (event.type === 'payment_intent.succeeded') {
        const pi = event.data.object as Stripe.PaymentIntent
        const order = await prisma.order.findFirst({
            where: { gatewayId: pi.id },
            include: { user: true, items: { include: { product: true } } },
        })
        if (order && order.status !== 'PAID') {
            let existingGw: Record<string, unknown> = {}
            try { if (order.gatewayData) existingGw = JSON.parse(order.gatewayData) } catch {}

            const stockReserved = existingGw.stockReserved === true

            const updated = await prisma.order.update({
                where: { id: order.id },
                data: {
                    status: 'PAID',
                    gatewayData: JSON.stringify({
                        ...existingGw,
                        lastWebhookStatus: 'succeeded',
                        lastWebhookAt: new Date().toISOString(),
                        paymentMethod: pi.payment_method_types?.[0] || existingGw.paymentMethod,
                    }),
                },
                include: { user: true, items: { include: { product: true } } },
            })

            if (!stockReserved) {
                // Pedido antigo (sem reserva) — decrementa agora para compatibilidade
                decreaseStock(updated.items).catch((err) => { console.error('[Stripe Webhook] Erro estoque:', err) })
            }
            dispatchBuyerWebhook(updated).catch((err) => { console.error('[Stripe Webhook] Erro webhook:', err) })
            console.log(`[Stripe Webhook] Pedido ${order.id} atualizado: ${order.status} → PAID`)
        }
    }

    if (event.type === 'payment_intent.payment_failed') {
        const pi = event.data.object as Stripe.PaymentIntent
        const order = await prisma.order.findFirst({
            where: { gatewayId: pi.id },
            include: { items: true },
            // select: { id: true, status: true, gatewayData: true },
        })
        if (order && order.status === 'PENDING') {
            let existingGw: Record<string, unknown> = {}
            try { if (order.gatewayData) existingGw = JSON.parse(order.gatewayData) } catch {}

            const stockReserved = existingGw.stockReserved === true
            const failReason = pi.last_payment_error?.message || pi.last_payment_error?.code || 'payment_failed'

            await prisma.order.update({
                where: { id: order.id },
                data: {
                    status: 'CANCELLED',
                    gatewayData: JSON.stringify({
                        ...existingGw,
                        lastWebhookStatus: 'failed',
                        lastWebhookAt: new Date().toISOString(),
                        statusDetail: failReason,
                    }),
                },
            })

            if (stockReserved) {
                increaseStock(order.items).catch((err) => { console.error('[Stripe Webhook] Erro restaurar estoque:', err) })
            }

            console.log(`[Stripe Webhook] Pedido ${order.id} falhou: ${failReason}`)
        }
    }

    if (event.type === 'charge.refunded') {
        const charge = event.data.object as Stripe.Charge
        const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
        if (piId) {
            const order = await prisma.order.findFirst({
                where: { gatewayId: piId },
                select: { id: true, status: true, gatewayData: true },
            })
            if (order && order.status !== 'REFUNDED') {
                let existingGw: Record<string, unknown> = {}
                try { if (order.gatewayData) existingGw = JSON.parse(order.gatewayData) } catch {}

                await prisma.order.update({
                    where: { id: order.id },
                    data: {
                        status: 'REFUNDED',
                        gatewayData: JSON.stringify({
                            ...existingGw,
                            lastWebhookStatus: 'refunded',
                            lastWebhookAt: new Date().toISOString(),
                        }),
                    },
                })
                console.log(`[Stripe Webhook] Pedido ${order.id} reembolsado`)
            }
        }
    }

    return NextResponse.json({ received: true })
}
