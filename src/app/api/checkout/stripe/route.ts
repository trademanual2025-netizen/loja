import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { getSetting, SETTINGS_KEYS } from '@/lib/config'
import Stripe from 'stripe'
import { decreaseStock, increaseStock } from '@/lib/inventory'

export async function POST(req: NextRequest) {
    const session = await getAuthUser()
    if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

    const secretKey = await getSetting(SETTINGS_KEYS.STRIPE_SECRET_KEY)
    if (!secretKey) return NextResponse.json({ error: 'Stripe não configurado.' }, { status: 400 })

    const { items, shippingCost, address, payWithPix, couponCode: clientCouponCode } = await req.json()

    const user = await prisma.user.findUnique({ where: { id: session.id } })
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

    const subtotal = items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0)

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
    const pixProductsSetting = await getSetting(SETTINGS_KEYS.PIX_DISCOUNT_PRODUCTS)
    const pixRate = Math.min(50, Math.max(0, parseFloat(pixRateStr || '5'))) / 100

    let pixApplies = false
    if (payWithPix === true && pixEnabled === 'true') {
        if (pixScope === 'selected' && pixProductsSetting) {
            const allowed = pixProductsSetting.split(',').filter(Boolean)
            pixApplies = items.every((i: { id: string }) => allowed.includes(i.id))
        } else {
            pixApplies = true
        }
    }
    const discountAmount = pixApplies ? Math.round((subtotal + shippingCost - couponDiscountAmount) * pixRate * 100) / 100 : 0
    const total = Math.max(0, Math.round((subtotal + shippingCost - couponDiscountAmount - discountAmount) * 100) / 100)

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
        const stripe = new Stripe(secretKey)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100),
            currency: 'brl',
            metadata: { userId: session.id },
            ...(pixApplies
                ? { payment_method_types: ['pix'] }
                : {
                    automatic_payment_methods: { enabled: true },
                    payment_method_options: {
                        card: { installments: { enabled: true } },
                    },
                }
            ),
        })

        const gwData = {
            paymentIntentId: paymentIntent.id,
            statusDetail: paymentIntent.status,
            stockReserved: true,
        }

        const order = await prisma.order.create({
            data: {
                userId: user.id,
                gateway: 'stripe',
                gatewayId: paymentIntent.id,
                gatewayData: JSON.stringify(gwData),
                status: 'PENDING',
                subtotal,
                discount: discountAmount + couponDiscountAmount,
                shippingCost,
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
        })

        return NextResponse.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id, orderId: order.id })
    } catch (err: unknown) {
        // Se algo deu errado após reservar o estoque, restaura
        await increaseStock(stockItems).catch(() => {})
        console.error('[Stripe Checkout] Error:', err)
        return NextResponse.json({ error: 'Erro ao criar PaymentIntent.' }, { status: 500 })
    }
}
