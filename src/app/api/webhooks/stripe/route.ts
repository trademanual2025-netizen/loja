import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { dispatchBuyerWebhook } from '@/lib/webhooks'
import { getSetting, SETTINGS_KEYS } from '@/lib/config'
import Stripe from 'stripe'
import { decreaseStock, increaseStock } from '@/lib/inventory'
import { triggerWhatsApp, WA_TRIGGERS } from '@/lib/whatsapp'

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
                decreaseStock(updated.items).catch((err) => { console.error('[Stripe Webhook] Erro estoque:', err) })
            }
            if ((updated as any).couponId) {
                prisma.coupon.update({ where: { id: (updated as any).couponId }, data: { usedCount: { increment: 1 } } }).catch((err) => { console.error('[Stripe Webhook] Erro coupon usedCount:', err) })
            }
            dispatchBuyerWebhook(updated as any).catch((err) => { console.error('[Stripe Webhook] Erro webhook:', err) })
            if ((updated as any).user?.phone) {
                triggerWhatsApp(WA_TRIGGERS.ORDER_PAID, {
                    phone: (updated as any).user.phone,
                    nome: (updated as any).user.name,
                    pedido: order.id.slice(-8).toUpperCase(),
                    total: (updated as any).total.toFixed(2).replace('.', ','),
                    produto: (updated as any).items?.[0]?.product?.name,
                    orderId: order.id,
                    userId: order.userId,
                }).catch(() => {})
            }
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

    if (event.type === 'payment_intent.canceled') {
        const pi = event.data.object as Stripe.PaymentIntent
        const order = await prisma.order.findFirst({
            where: { gatewayId: pi.id },
            include: { items: true },
        })
        if (order && order.status === 'PENDING') {
            let existingGw: Record<string, unknown> = {}
            try { if (order.gatewayData) existingGw = JSON.parse(order.gatewayData) } catch {}

            const stockReserved = existingGw.stockReserved === true

            await prisma.order.update({
                where: { id: order.id },
                data: {
                    status: 'CANCELLED',
                    gatewayData: JSON.stringify({
                        ...existingGw,
                        lastWebhookStatus: 'canceled',
                        lastWebhookAt: new Date().toISOString(),
                        statusDetail: pi.cancellation_reason || 'canceled',
                    }),
                },
            })

            if (stockReserved) {
                increaseStock(order.items).catch((err) => { console.error('[Stripe Webhook] Erro restaurar estoque (canceled):', err) })
            }

            console.log(`[Stripe Webhook] Pedido ${order.id} cancelado: ${pi.cancellation_reason || 'canceled'}`)
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
