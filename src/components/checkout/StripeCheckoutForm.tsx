'use client'

import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart'
import { fbTrackPurchase } from '@/components/tracking/FacebookPixel'
import { gtagPurchase } from '@/components/tracking/GoogleAds'

interface Props {
    orderIdStr: string
    totalAmount: number
    items: any[]
    adsConfig: { adsId: string; adsLabel: string } | null
}

export function StripeCheckoutForm({ orderIdStr, totalAmount, items, adsConfig }: Props) {
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

        // confirmPayment: com redirect:'if_required', permanece na página para cartão/pix/boleto
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
            fbTrackPurchase(orderIdStr, totalAmount, productIds)
            fetch('/api/tracking/capi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event_name: 'Purchase', value: totalAmount, order_id: orderIdStr }),
            }).catch(() => { })
            if (adsConfig) gtagPurchase(orderIdStr, totalAmount, adsConfig.adsLabel, adsConfig.adsId, items)
        }

        switch (paymentIntent.status) {
            case 'succeeded':
                // Cartão aprovado imediatamente
                trackPurchase()
                clearCart()
                router.push(`/pedido/${orderIdStr}`)
                break

            case 'processing':
                // Boleto ou Pix aguardando confirmação assíncrona
                trackPurchase()
                clearCart()
                setProcessingMsg('Pagamento em processamento. Você receberá a confirmação por email.')
                setTimeout(() => router.push(`/pedido/${orderIdStr}`), 3000)
                break

            case 'requires_payment_method':
                // Cartão recusado ou método inválido
                toast.error('Pagamento recusado. Tente outro método de pagamento.')
                break

            case 'requires_action':
                // Stripe está pedindo ação adicional (ex: 3D Secure) - o SDK cuida disso automaticamente
                setProcessingMsg('Complete a autenticação na janela que foi aberta.')
                break

            default:
                // Fallback: qualquer outro status → redirecionar para ver o pedido
                clearCart()
                router.push(`/pedido/${orderIdStr}`)
        }

        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* PaymentElement exibe automaticamente os métodos habilitados no Dashboard:
                Cartão de Crédito/Débito (com parcelamento se configurado), Pix, Boleto */}
            <div style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <PaymentElement options={{
                    layout: 'tabs',
                    defaultValues: {
                        billingDetails: {}
                    }
                }} />
            </div>

            {processingMsg && (
                <div style={{
                    padding: '12px 16px',
                    background: 'var(--bg-card2)',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    fontSize: '0.88rem',
                    color: 'var(--text-muted)',
                }}>
                    ⏳ {processingMsg}
                </div>
            )}

            <button className="btn btn-primary" disabled={!stripe || loading || !!processingMsg} style={{ width: '100%' }}>
                {loading
                    ? <span className="spinner" />
                    : `🔒 Pagar R$ ${totalAmount.toFixed(2).replace('.', ',')}`
                }
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Pagamento processado com segurança pela Stripe — SSL 256-bit
            </p>
        </form>
    )
}
