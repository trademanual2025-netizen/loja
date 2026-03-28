import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSetting, SETTINGS_KEYS } from '@/lib/config'

export async function POST(req: NextRequest) {
    const { paymentIntentId, installments } = await req.json()
    if (!paymentIntentId || !installments) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

    const secretKey = await getSetting(SETTINGS_KEYS.STRIPE_SECRET_KEY)
    if (!secretKey) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })

    const stripe = new Stripe(secretKey)
    try {
        const opts: Stripe.PaymentIntentUpdateParams = {
            payment_method_options: {
                card: {
                    installments: installments > 1
                        ? { plan: { count: installments, interval: 'month', type: 'fixed_count' } }
                        : { enabled: true },
                },
            },
        }
        await stripe.paymentIntents.update(paymentIntentId, opts)
        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
