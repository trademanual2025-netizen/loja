import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { dispatchBuyerWebhook } from '@/lib/webhooks'
import { getSetting, SETTINGS_KEYS } from '@/lib/config'
import { decreaseStock } from '@/lib/inventory'
import crypto from 'crypto'

async function verifyMPSignature(req: NextRequest, body: string): Promise<boolean> {
    const webhookSecret = await getSetting('mp_webhook_secret')
    if (!webhookSecret) return true

    const xSignature = req.headers.get('x-signature') || ''
    const xRequestId = req.headers.get('x-request-id') || ''

    const parts: Record<string, string> = {}
    xSignature.split(',').forEach(part => {
        const [key, val] = part.trim().split('=')
        if (key && val) parts[key] = val
    })

    const ts = parts['ts'] || ''
    const hash = parts['v1'] || ''
    if (!ts || !hash) return false

    const url = new URL(req.url)
    const dataId = url.searchParams.get('data.id') || ''

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
    const hmac = crypto.createHmac('sha256', webhookSecret).update(manifest).digest('hex')

    return hmac === hash
}

export async function POST(req: NextRequest) {
    const rawBody = await req.text()
    let body: any
    try {
        body = JSON.parse(rawBody)
    } catch {
        return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
    }

    const isValid = await verifyMPSignature(req, rawBody)
    if (!isValid) {
        console.error('[MP Webhook] Assinatura inválida')
        return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
    }

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
                decreaseStock(updated.items).catch((err) => { console.error('[MP Webhook] Erro estoque:', err) })
                dispatchBuyerWebhook(updated).catch((err) => { console.error('[MP Webhook] Erro webhook:', err) })
            }
        }
    } catch (err) {
        console.error('MP Webhook error:', err)
    }

    return NextResponse.json({ ok: true })
}
