import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { dispatchBuyerWebhook } from '@/lib/webhooks'
import { getSetting, SETTINGS_KEYS } from '@/lib/config'
import { decreaseStock } from '@/lib/inventory'

export async function POST(req: NextRequest) {
    const body = await req.json()
    const { type, data } = body

    if (type !== 'payment') return NextResponse.json({ ok: true })

    const paymentId = data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    const accessToken = await getSetting(SETTINGS_KEYS.MP_ACCESS_TOKEN)
    if (!accessToken) return NextResponse.json({ error: 'MP não configurado' }, { status: 400 })

    try {
        const { MercadoPagoConfig, Payment } = await import('mercadopago')
        const client = new MercadoPagoConfig({ accessToken })
        const payment = new Payment(client)
        const paymentData = await payment.get({ id: String(paymentId) })

        if (paymentData.status === 'approved') {
            const order = await prisma.order.findFirst({
                where: { gatewayId: String(paymentId) },
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
    } catch (err) {
        console.error('MP Webhook error:', err)
    }

    return NextResponse.json({ ok: true })
}
