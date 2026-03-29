import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verify } from 'jsonwebtoken'
import { getSetting, SETTINGS_KEYS } from '@/lib/config'
import { dispatchBuyerWebhook } from '@/lib/webhooks'
import { decreaseStock, increaseStock } from '@/lib/inventory'
import { triggerWhatsApp, WA_TRIGGERS } from '@/lib/whatsapp'

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

export async function POST(req: NextRequest) {
    const session = await getUserFromRequest(req)
    if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

    const accessToken = await getSetting(SETTINGS_KEYS.MP_ACCESS_TOKEN)
    if (!accessToken) return NextResponse.json({ error: 'Mercado Pago não configurado.' }, { status: 400 })

    const { items, address, shippingCost, formData, payWithPix, couponCode: clientCouponCode } = await req.json()

    const user = await prisma.user.findUnique({ where: { id: session.id } })
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

    const subtotal = items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0)
    const shipping = typeof shippingCost === 'number' ? shippingCost : parseFloat(shippingCost) || 0

    let validatedCouponId: string | null = null
    let validatedCouponCode: string | null = null
    let couponDiscountAmount = 0
    if (clientCouponCode) {
        const coupon = await prisma.coupon.findUnique({ where: { code: String(clientCouponCode).toUpperCase().trim() } })
        if (coupon && coupon.active && (!coupon.expiresAt || new Date() <= coupon.expiresAt) && (!coupon.maxUses || coupon.usedCount < coupon.maxUses)) {
            let eligibleItems = items
            if (coupon.scope === 'products' && coupon.productIds) {
                const ids = coupon.productIds.split(',').map((s: string) => s.trim()).filter(Boolean)
                if (ids.length > 0) eligibleItems = items.filter((i: any) => ids.includes(i.id))
            } else if (coupon.scope === 'categories' && coupon.categoryIds) {
                const cats = coupon.categoryIds.split(',').map((s: string) => s.trim()).filter(Boolean)
                if (cats.length > 0) {
                    const prods = await prisma.product.findMany({ where: { categoryId: { in: cats } }, select: { id: true } })
                    const pSet = new Set(prods.map((p: any) => p.id))
                    eligibleItems = items.filter((i: any) => pSet.has(i.id))
                }
            }
            if (eligibleItems.length > 0) {
                const eligibleSub = eligibleItems.reduce((s: number, i: any) => s + i.price * i.quantity, 0)
                couponDiscountAmount = coupon.type === 'percentage'
                    ? Math.round(eligibleSub * (coupon.value / 100) * 100) / 100
                    : Math.min(coupon.value, eligibleSub)
                validatedCouponId = coupon.id
                validatedCouponCode = coupon.code
            }
        }
    }

    const pixEnabled = await getSetting(SETTINGS_KEYS.PIX_DISCOUNT_ENABLED)
    const pixRateStr = await getSetting(SETTINGS_KEYS.PIX_DISCOUNT_RATE)
    const pixScope = await getSetting(SETTINGS_KEYS.PIX_DISCOUNT_SCOPE)
    const pixProducts = await getSetting(SETTINGS_KEYS.PIX_DISCOUNT_PRODUCTS)
    const pixRate = Math.min(50, Math.max(0, parseFloat(pixRateStr || '5'))) / 100

    const requestedPix = payWithPix === true || formData?.payment_method_id === 'bank_transfer'
    let pixApplies = false
    if (requestedPix && pixEnabled === 'true') {
        if (pixScope === 'selected' && pixProducts) {
            const allowed = pixProducts.split(',').filter(Boolean)
            pixApplies = items.every((i: { id: string }) => allowed.includes(i.id))
        } else {
            pixApplies = true
        }
    }
    const discountAmount = pixApplies ? Math.round((subtotal + shipping - couponDiscountAmount) * pixRate * 100) / 100 : 0
    const total = Math.max(0, Math.round((subtotal + shipping - couponDiscountAmount - discountAmount) * 100) / 100)

    const recentOrder = await prisma.order.findFirst({
        where: {
            userId: session.id,
            status: 'PENDING',
            createdAt: { gte: new Date(Date.now() - 30000) },
        },
        orderBy: { createdAt: 'desc' },
    })
    if (recentOrder) {
        return NextResponse.json({
            orderId: recentOrder.id,
            status: 'pending',
            statusDetail: 'Pedido já em andamento',
        })
    }

    // Reservar estoque antes de criar o pagamento
    const stockItems = items.map((i: { id: string; quantity: number; variantId?: string }) => ({
        productId: i.id,
        variantId: i.variantId || null,
        quantity: i.quantity,
    }))

    try {
        await decreaseStock(stockItems)
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Estoque insuficiente.'
        return NextResponse.json({ error: msg }, { status: 400 })
    }

    try {
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
            await increaseStock(stockItems).catch(() => {})
            return NextResponse.json({ error: 'Valor total inválido.' }, { status: 400 })
        }

        console.log('[MercadoPago] Request:', JSON.stringify(requestData, null, 2))

        const mpPayment = await payment.create({ body: requestData })

        const gwData: Record<string, unknown> = {
            paymentMethod: mpPayment.payment_method_id,
            statusDetail: mpPayment.status_detail,
            stockReserved: true,
        }
        if (mpPayment.point_of_interaction?.transaction_data) {
            const txData = mpPayment.point_of_interaction.transaction_data
            gwData.pixQrCode = txData.qr_code || null
            gwData.pixQrCodeBase64 = txData.qr_code_base64 || null
            gwData.ticketUrl = txData.ticket_url || null
        }
        if (mpPayment.transaction_details?.external_resource_url) {
            gwData.boletoUrl = mpPayment.transaction_details.external_resource_url
        }
        if (mpPayment.date_of_expiration) {
            gwData.expiresAt = mpPayment.date_of_expiration
        }

        const orderStatus = mpPayment.status === 'approved' ? 'PAID' : 'PENDING'

        const order = await prisma.order.create({
            data: {
                userId: user.id,
                gateway: 'mercadopago',
                gatewayId: String(mpPayment.id),
                gatewayData: JSON.stringify(gwData),
                status: orderStatus,
                subtotal,
                discount: discountAmount + couponDiscountAmount,
                shippingCost: shipping,
                total,
                ...(validatedCouponId ? { couponId: validatedCouponId, couponCode: validatedCouponCode || '' } : {}),
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

        // Estoque já decrementado — só dispara webhook de comprador
        if (order.status === 'PAID') {
            if (validatedCouponId) {
                prisma.coupon.update({ where: { id: validatedCouponId }, data: { usedCount: { increment: 1 } } }).catch(() => {})
            }
            dispatchBuyerWebhook(order as any).catch(() => {})
        }

        if (order.status === 'PENDING' && user.phone) {
            const payMethod = String(gwData.paymentMethod || '')
            const isPix = payMethod === 'pix' || !!gwData.pixQrCode
            const isBoleto = payMethod === 'boleto' || !!gwData.boletoUrl
            const trigger = isPix ? WA_TRIGGERS.ORDER_PIX_PENDING : isBoleto ? WA_TRIGGERS.ORDER_BOLETO_PENDING : null
            if (trigger) {
                triggerWhatsApp(trigger, {
                    phone: user.phone,
                    nome: user.name,
                    pedido: order.id.slice(-8).toUpperCase(),
                    total: total.toFixed(2).replace('.', ','),
                    produto: order.items?.[0]?.product?.name,
                    orderId: order.id,
                    userId: user.id,
                }).catch(() => {})
            }
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
        // Se algo deu errado após reservar o estoque, restaura
        await increaseStock(stockItems).catch(() => {})
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
