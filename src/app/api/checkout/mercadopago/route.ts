import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verify } from 'jsonwebtoken'
import { getSetting, SETTINGS_KEYS } from '@/lib/config'
import { dispatchBuyerWebhook } from '@/lib/webhooks'
import { decreaseStock } from '@/lib/inventory'

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

// POST /api/checkout/mercadopago — cria pagamento
export async function POST(req: NextRequest) {
    const session = await getUserFromRequest(req)
    if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

    const accessToken = await getSetting(SETTINGS_KEYS.MP_ACCESS_TOKEN)
    if (!accessToken) return NextResponse.json({ error: 'Mercado Pago não configurado.' }, { status: 400 })

    const { items, address, shippingCost, formData } = await req.json()

    const user = await prisma.user.findUnique({ where: { id: session.id } })
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

    const subtotal = items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0)
    const shipping = typeof shippingCost === 'number' ? shippingCost : parseFloat(shippingCost) || 0
    const total = Math.round((subtotal + shipping) * 100) / 100

    try {
        // Criar pagamento no MP
        const { MercadoPagoConfig, Payment } = await import('mercadopago')
        const client = new MercadoPagoConfig({ accessToken })
        const payment = new Payment(client)

        const requestData: Record<string, unknown> = {
            ...formData,
            transaction_amount: total,
            description: `Pedido - ${items.length} item(ns)`,
            payer: {
                ...formData?.payer,
                email: user.email,
            },
        }

        if (!requestData.transaction_amount || (requestData.transaction_amount as number) <= 0) {
            return NextResponse.json({ error: 'Valor total inválido.' }, { status: 400 })
        }

        console.log('[MercadoPago] Request:', JSON.stringify(requestData, null, 2))

        const mpPayment = await payment.create({ body: requestData })

        // Criar pedido no banco
        const order = await prisma.order.create({
            data: {
                userId: user.id,
                gateway: 'mercadopago',
                gatewayId: String(mpPayment.id),
                status: mpPayment.status === 'approved' ? 'PAID' : 'PENDING',
                subtotal,
                shippingCost: shipping,
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
            include: {
                user: true,
                items: { include: { product: true } },
            },
        })

        // Webhook comprador se aprovado + Baixa de estoque
        if (order.status === 'PAID') {
            decreaseStock(order.items).catch(() => { })
            dispatchBuyerWebhook(order).catch(() => { })
        }

        const response: Record<string, unknown> = {
            orderId: order.id,
            status: mpPayment.status,
            statusDetail: mpPayment.status_detail,
        }

        if (mpPayment.point_of_interaction?.transaction_data) {
            const txData = mpPayment.point_of_interaction.transaction_data
            response.pixQrCode = txData.qr_code || null
            response.pixQrCodeBase64 = txData.qr_code_base64 || null
            response.ticketUrl = txData.ticket_url || null
        }

        if (mpPayment.transaction_details?.external_resource_url) {
            response.boletoUrl = mpPayment.transaction_details.external_resource_url
        }

        return NextResponse.json(response)
    } catch (err: unknown) {
        console.error('[MercadoPago] Error:', err)
        let msg = 'Erro ao processar pagamento.'
        if (err && typeof err === 'object') {
            const e = err as { cause?: Array<{ description?: string }>; message?: string }
            if (e.cause?.[0]?.description) {
                msg = e.cause[0].description
            } else if (e.message) {
                msg = e.message
            }
        }
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
