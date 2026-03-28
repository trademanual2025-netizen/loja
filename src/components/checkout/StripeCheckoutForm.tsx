'use client'

import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart'
import { fbTrackPurchase } from '@/components/tracking/FacebookPixel'
import { gtagPurchase } from '@/components/tracking/GoogleAds'
import type { TrackingUserData } from '@/lib/tracking'
import type { GtagUserData } from '@/components/tracking/GoogleAds'

interface Props {
    orderIdStr: string
    totalAmount: number
    items: any[]
    adsConfig: { adsId: string; adsLabel: string } | null
    trackingUser?: TrackingUserData
    installments: number
    paymentIntentId: string
    onInstallmentsChange: (n: number) => void
}

export function StripeCheckoutForm({ orderIdStr, totalAmount, items, adsConfig, trackingUser, installments, paymentIntentId, onInstallmentsChange }: Props) {
    const stripe = useStripe()
    const elements = useElements()
    const [loading, setLoading] = useState(false)
    const [processingMsg, setProcessingMsg] = useState<string | null>(null)
    const { clearCart } = useCart()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!stripe || !elements) return

        setLoading(true)
        setProcessingMsg(null)

        if (installments > 1 && paymentIntentId) {
            try {
                await fetch('/api/checkout/stripe/update-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentIntentId, installments }),
                })
            } catch { }
        }

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        })

        if (error) {
            toast.error(error.message || 'Erro ao processar o pagamento.')
            setLoading(false)
            return
        }

        if (!paymentIntent) {
            toast.error('Resposta inesperada do gateway. Verifique seu pedido.')
            setLoading(false)
            return
        }

        const trackPurchase = () => {
            const productIds = items.map((i) => i.id)
            fbTrackPurchase(orderIdStr, totalAmount, productIds, trackingUser)
            const gtu: GtagUserData | undefined = trackingUser ? { email: trackingUser.email, phone: trackingUser.phone, firstName: trackingUser.firstName, lastName: trackingUser.lastName, city: trackingUser.city, state: trackingUser.state, zipCode: trackingUser.zipCode, country: trackingUser.country } : undefined
            if (adsConfig) gtagPurchase(orderIdStr, totalAmount, adsConfig.adsLabel, adsConfig.adsId, items, gtu)
        }

        switch (paymentIntent.status) {
            case 'succeeded':
                trackPurchase()
                clearCart()
                router.push(`/pedido/${orderIdStr}`)
                break
            case 'processing':
                trackPurchase()
                clearCart()
                setProcessingMsg('Pagamento em processamento. Você receberá a confirmação por email.')
                setTimeout(() => router.push(`/pedido/${orderIdStr}`), 3000)
                break
            case 'requires_payment_method':
                toast.error('Pagamento recusado. Tente outro método de pagamento.')
                break
            case 'requires_action':
                setProcessingMsg('Complete a autenticação na janela que foi aberta.')
                break
            default:
                clearCart()
                router.push(`/pedido/${orderIdStr}`)
        }

        setLoading(false)
    }

    const installmentValue = Math.ceil(totalAmount / installments * 100) / 100

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ padding: '14px 16px', background: 'var(--bg-card2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8, letterSpacing: '0.04em' }}>
                    NÚMERO DE PARCELAS
                </label>
                <select
                    value={installments}
                    onChange={e => onInstallmentsChange(Number(e.target.value))}
                    style={{
                        width: '100%', padding: '10px 12px', borderRadius: 8,
                        border: '1px solid var(--border)', background: 'var(--bg-card)',
                        color: 'var(--text)', fontSize: '0.95rem', cursor: 'pointer',
                        fontWeight: 500,
                    }}
                >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(n => {
                        const val = Math.ceil(totalAmount / n * 100) / 100
                        return (
                            <option key={n} value={n}>
                                {n === 1
                                    ? `1x de R$ ${val.toFixed(2).replace('.', ',')} (à vista)`
                                    : `${n}x de R$ ${val.toFixed(2).replace('.', ',')}`
                                }
                            </option>
                        )
                    })}
                </select>
                {installments > 1 && (
                    <div style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Total: R$ {totalAmount.toFixed(2).replace('.', ',')} · Juros conforme bandeira do cartão
                    </div>
                )}
            </div>

            <div style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <PaymentElement options={{ layout: 'tabs', defaultValues: { billingDetails: {} } }} />
            </div>

            {processingMsg && (
                <div style={{ padding: '12px 16px', background: 'var(--bg-card2)', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    ⏳ {processingMsg}
                </div>
            )}

            <button className="btn btn-primary" disabled={!stripe || loading || !!processingMsg} style={{ width: '100%' }}>
                {loading
                    ? <span className="spinner" />
                    : `🔒 Pagar ${installments > 1 ? `${installments}x de R$ ${installmentValue.toFixed(2).replace('.', ',')}` : `R$ ${totalAmount.toFixed(2).replace('.', ',')}`}`
                }
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Pagamento processado com segurança pela Stripe — SSL 256-bit
            </p>
        </form>
    )
}
