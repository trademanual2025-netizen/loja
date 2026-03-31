import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, forbiddenResponse } from '@/lib/admin-auth'
import { getSetting } from '@/lib/config'
import { prisma } from '@/lib/prisma'
import { LEAD_FIELDS, BUYER_FIELDS, type FieldMapping } from '@/lib/webhook-fields'

function applyFieldMapping(data: Record<string, unknown>, mapping: FieldMapping | null): Record<string, unknown> {
    if (!mapping) return data
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
        const fieldConfig = mapping[key]
        if (!fieldConfig) { result[key] = value; continue }
        if (!fieldConfig.enabled) continue
        result[fieldConfig.customName || key] = value
    }
    return result
}

function buildTestPayload(type: 'lead' | 'buyer', mapping: FieldMapping | null) {
    if (type === 'lead') {
        const meta: Record<string, unknown> = { event: 'new_lead', timestamp: new Date().toISOString() }
        const data: Record<string, unknown> = {
            id: 'test-lead-001',
            name: 'Maria Teste',
            email: 'maria@teste.com',
            phone: '11999990000',
            cpf: '123.456.789-00',
            source: 'checkout',
            created_at: new Date().toISOString(),
        }
        const mappedMeta = applyFieldMapping(meta, mapping)
        const mappedData = applyFieldMapping(data, mapping)
        return { ...mappedMeta, data: mappedData }
    }

    const meta: Record<string, unknown> = { event: 'purchase', timestamp: new Date().toISOString() }
    const address: Record<string, unknown> = {
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 4',
        neighborhood: 'Centro',
        city: 'Sao Paulo',
        state: 'SP',
        zip: '01000-000',
    }
    const data: Record<string, unknown> = {
        order_id: 'test-order-001',
        gateway_id: 'pay_test_123',
        name: 'Maria Teste',
        email: 'maria@teste.com',
        phone: '11999990000',
        cpf: '123.456.789-00',
        subtotal: 189.90,
        discount: 0,
        shipping: 15.00,
        total: 204.90,
        currency: 'BRL',
        gateway: 'stripe',
        products: [{ name: 'Anel Dourado', qty: 1, price: 189.90 }],
    }
    const mappedMeta = applyFieldMapping(meta, mapping)
    const mappedData = applyFieldMapping(data, mapping)
    const mappedAddress = applyFieldMapping(address, mapping)
    if (Object.keys(mappedAddress).length > 0) {
        mappedData.address = mappedAddress
    }
    return { ...mappedMeta, data: mappedData }
}

export async function POST(req: NextRequest) {
    const perm = await requirePermission(req, 'webhooks')
    if (!perm) return forbiddenResponse()

    try {
        const { type } = await req.json() as { type: 'lead' | 'buyer' }

        if (type !== 'lead' && type !== 'buyer') {
            return NextResponse.json({ error: 'Tipo invalido' }, { status: 400 })
        }

        const urlKey = type === 'lead' ? 'webhook_lead_url' : 'webhook_buyer_url'
        const fieldsKey = type === 'lead' ? 'webhook_lead_fields' : 'webhook_buyer_fields'

        const url = await getSetting(urlKey)
        if (!url) {
            return NextResponse.json({ error: 'URL do webhook nao configurada.' }, { status: 400 })
        }

        let mapping: FieldMapping | null = null
        try {
            const raw = await getSetting(fieldsKey)
            if (raw) mapping = JSON.parse(raw)
        } catch {}

        const payload = buildTestPayload(type, mapping)
        const body = JSON.stringify(payload)

        let status: number | null = null
        let success = false
        let errorMsg: string | null = null

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
                signal: AbortSignal.timeout(10000),
            })
            status = res.status
            success = res.ok
        } catch (err) {
            errorMsg = err instanceof Error ? err.message : 'Erro desconhecido'
        }

        await prisma.webhookLog.create({
            data: {
                type,
                url,
                payload: body,
                status,
                success,
            },
        })

        if (success) {
            return NextResponse.json({ success: true, status, payload })
        }

        return NextResponse.json({
            success: false,
            status,
            error: errorMsg || `Webhook retornou status ${status}`,
            payload,
        })
    } catch (err) {
        console.error('[Webhook Test]', err)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
