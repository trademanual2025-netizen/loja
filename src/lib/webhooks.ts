import { prisma } from './prisma'
import { getSetting, SETTINGS_KEYS } from './config'
import type { FieldMapping } from './webhook-fields'

function applyFieldMapping(data: Record<string, unknown>, mapping: FieldMapping | null): Record<string, unknown> {
    if (!mapping) return data

    const result: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(data)) {
        const fieldConfig = mapping[key]

        if (!fieldConfig) {
            result[key] = value
            continue
        }

        if (!fieldConfig.enabled) continue

        const outputKey = fieldConfig.customName || key
        result[outputKey] = value
    }

    return result
}

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
    } catch (err) {
        console.error(`[Webhook] Falha ao enviar para ${url}:`, err instanceof Error ? err.message : err)
    }

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

    let mapping: FieldMapping | null = null
    try {
        const raw = await getSetting('webhook_lead_fields')
        if (raw) mapping = JSON.parse(raw)
    } catch {}

    const metaFields: Record<string, unknown> = {
        event: 'new_lead',
        timestamp: new Date().toISOString(),
    }

    const dataFields: Record<string, unknown> = {
        id: lead.id,
        name: lead.user.name,
        email: lead.user.email,
        phone: lead.user.phone,
        cpf: lead.user.cpf,
        source: lead.source,
        created_at: lead.createdAt.toISOString(),
    }

    const mappedMeta = applyFieldMapping(metaFields, mapping)
    const mappedData = applyFieldMapping(dataFields, mapping)

    await dispatch(url, { ...mappedMeta, data: mappedData }, 'lead', lead.id)
}

export async function dispatchBuyerWebhook(order: {
    id: string
    gateway: string
    gatewayId: string | null
    subtotal: number
    discount: number
    shippingCost: number
    total: number
    zipCode: string
    street: string
    number: string | null
    complement: string | null
    neighborhood: string
    city: string
    state: string
    user: { name: string; email: string; phone: string | null; cpf: string | null }
    items: Array<{ quantity: number; price: number; product: { name: string } }>
}) {
    const url = await getSetting(SETTINGS_KEYS.WEBHOOK_BUYER_URL)
    if (!url) return

    let mapping: FieldMapping | null = null
    try {
        const raw = await getSetting('webhook_buyer_fields')
        if (raw) mapping = JSON.parse(raw)
    } catch {}

    const metaFields: Record<string, unknown> = {
        event: 'purchase',
        timestamp: new Date().toISOString(),
    }

    const addressFields: Record<string, unknown> = {
        street: order.street,
        number: order.number,
        complement: order.complement,
        neighborhood: order.neighborhood,
        city: order.city,
        state: order.state,
        zip: order.zipCode,
    }

    const dataFields: Record<string, unknown> = {
        order_id: order.id,
        gateway_id: order.gatewayId,
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone,
        cpf: order.user.cpf,
        subtotal: order.subtotal,
        discount: order.discount,
        shipping: order.shippingCost,
        total: order.total,
        currency: 'BRL',
        gateway: order.gateway,
        products: order.items.map((i) => ({
            name: i.product.name,
            qty: i.quantity,
            price: i.price,
        })),
    }

    const mappedMeta = applyFieldMapping(metaFields, mapping)
    const mappedData = applyFieldMapping(dataFields, mapping)
    const mappedAddress = applyFieldMapping(addressFields, mapping)

    if (Object.keys(mappedAddress).length > 0) {
        mappedData.address = mappedAddress
    }

    await dispatch(url, { ...mappedMeta, data: mappedData }, 'buyer', undefined, order.id)
}
