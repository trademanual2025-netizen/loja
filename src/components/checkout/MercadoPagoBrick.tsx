'use client'

import { useEffect, useState } from 'react'
import { initMercadoPago, Payment } from '@mercadopago/sdk-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart'
import { fbTrackPurchase } from '@/components/tracking/FacebookPixel'
import { gtagPurchase } from '@/components/tracking/GoogleAds'
import Link from 'next/link'

interface MPProps {
    publicKey: string
    totalAmount: number
    items: any[]
    address: any
    shippingCost: number
    adsConfig: { adsId: string; adsLabel: string } | null
}

export function MercadoPagoBrick({ publicKey, totalAmount, items, address, shippingCost, adsConfig }: MPProps) {
    const [isReady, setIsReady] = useState(false)
    const [pendingOrderId, setPendingOrderId] = useState<string | null>(null)
    const [pendingStatus, setPendingStatus] = useState<'pix' | 'boleto' | 'other' | null>(null)
    const { clearCart } = useCart()
    const router = useRouter()

    useEffect(() => {
        if (publicKey) {
            initMercadoPago(publicKey, { locale: 'pt-BR' })
            setIsReady(true)
        }
    }, [publicKey])

    if (!isReady) return <div className="spinner" />

    const initialization = {
        amount: totalAmount,
    }

    const customization = {
        paymentMethods: {
            creditCard: 'all',
            debitCard: 'all',
            ticket: 'all',        // Boleto
            bankTransfer: 'all',  // Pix
        },
        visual: {
            style: {
                theme: 'default',
            }
        }
    }

    const onSubmit = async ({ selectedPaymentMethod, formData }: any) => {
        return new Promise<void>((resolve, reject) => {
            fetch('/api/checkout/mercadopago', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items, address, shippingCost, formData }),
            })
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        toast.error(data.error)
                        reject()
                        return
                    }

                    const isApproved = data.status === 'approved'
                    const isPix = selectedPaymentMethod === 'bank_transfer' || data.statusDetail?.includes('pix')
                    const isBoleto = selectedPaymentMethod === 'ticket'

                    if (isApproved) {
                        // Pagamento aprovado imediatamente (cartão de crédito/débito)
                        const productIds = items.map((i) => i.id)
                        fbTrackPurchase(data.orderId, totalAmount, productIds)
                        fetch('/api/tracking/capi', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ event_name: 'Purchase', value: totalAmount, order_id: data.orderId }),
                        }).catch(() => { })
                        if (adsConfig) gtagPurchase(data.orderId, totalAmount, adsConfig.adsLabel, adsConfig.adsId, items)
                        clearCart()
                        router.push(`/pedido/${data.orderId}`)
                    } else {
                        // Pagamento pendente (Pix QR ou Boleto) 
                        // → NÃO redirecionar: o Brick exibe o QR/código automaticamente
                        setPendingOrderId(data.orderId)
                        setPendingStatus(isPix ? 'pix' : isBoleto ? 'boleto' : 'other')
                    }

                    resolve()
                })
                .catch(() => {
                    toast.error('Erro ao processar pagamento.')
                    reject()
                })
        })
    }

    const onError = async (error: any) => {
        console.error(error)
        toast.error('Ocorreu um erro no formulário de pagamento.')
    }

    const onReady = async () => { }

    return (
        <div>
            <Payment
                initialization={initialization}
                customization={customization as any}
                onSubmit={onSubmit}
                onReady={onReady}
                onError={onError}
            />

            {/* Banner exibido APÓS submissão de Pix ou Boleto */}
            {pendingOrderId && (
                <div style={{
                    marginTop: 20,
                    padding: '16px 20px',
                    background: 'var(--bg-card2)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                }}>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {pendingStatus === 'pix' && '📱 Pix gerado! Escaneie o QR Code acima para pagar.'}
                        {pendingStatus === 'boleto' && '🧾 Boleto gerado! Copie o código acima ou baixe o PDF.'}
                        {pendingStatus === 'other' && '⏳ Pagamento em processamento...'}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Seu pedido foi registrado. O status será atualizado automaticamente após a confirmação do pagamento.
                    </p>
                    <Link href={`/pedido/${pendingOrderId}`} className="btn btn-secondary" style={{ fontSize: '0.85rem', width: 'fit-content' }}>
                        Ver meu pedido →
                    </Link>
                </div>
            )}
        </div>
    )
}
