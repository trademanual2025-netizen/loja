import { prisma } from './prisma'
import { getSetting, SETTINGS_KEYS } from './config'

async function dispatch(url: string, payload: object, type: 'lead' | 'buyer', leadId?: string, orderId?: string) {
    let status: number | null = null
    let success = false
    const body = JSON.stringify(payload)

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
        })
        status = res.status
        success = res.ok
    } catch { }

    await prisma.webhookLog.create({
        data: {
            type,
            url,
            payload: body,
            status,
            success,
            leadId: leadId ?? null,
            orderId: orderId ?? null,
        },
    })
}

export async function dispatchLeadWebhook(lead: {
    id: string
    userId: string
    source: string
    createdAt: Date
    user: { name: string; email: string; phone: string | null; cpf: string | null }
}) {
    const url = await getSetting(SETTINGS_KEYS.WEBHOOK_LEAD_URL)
    if (!url) return

    await dispatch(
        url,
        {
            event: 'new_lead',
            timestamp: new Date().toISOString(),
            data: {
                id: lead.id,
                name: lead.user.name,
                email: lead.user.email,
                phone: lead.user.phone,
                cpf: lead.user.cpf,
                source: lead.source,
                created_at: lead.createdAt.toISOString(),
            },
        },
        'lead',
        lead.id
    )
}

export async function dispatchBuyerWebhook(order: {
    id: string
    gateway: string
    gatewayId: string | null
    subtotal: number
    shippingCost: number
    total: number
    zipCode: string
    street: string
    number: string
    complement: string | null
    neighborhood: string
    city: string
    state: string
    user: { name: string; email: string; phone: string | null; cpf: string | null }
    items: Array<{ quantity: number; price: number; product: { name: string } }>
}) {
    const url = await getSetting(SETTINGS_KEYS.WEBHOOK_BUYER_URL)
    if (!url) return

    await dispatch(
        url,
        {
            event: 'purchase',
            timestamp: new Date().toISOString(),
            data: {
                order_id: order.id,
                gateway_id: order.gatewayId,
                name: order.user.name,
                email: order.user.email,
                phone: order.user.phone,
                cpf: order.user.cpf,
                address: {
                    street: order.street,
                    number: order.number,
                    complement: order.complement,
                    neighborhood: order.neighborhood,
                    city: order.city,
                    state: order.state,
                    zip: order.zipCode,
                },
                subtotal: order.subtotal,
                shipping: order.shippingCost,
                total: order.total,
                currency: 'BRL',
                gateway: order.gateway,
                products: order.items.map((i) => ({
                    name: i.product.name,
                    qty: i.quantity,
                    price: i.price,
                })),
            },
        },
        'buyer',
        undefined,
        order.id
    )
}
