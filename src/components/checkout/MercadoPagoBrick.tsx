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
    const [pixData, setPixData] = useState<{ qrCode: string | null; qrCodeBase64: string | null } | null>(null)
    const [boletoUrl, setBoletoUrl] = useState<string | null>(null)
    const [pixCopied, setPixCopied] = useState(false)
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
                        setPendingOrderId(data.orderId)
                        setPendingStatus(isPix ? 'pix' : isBoleto ? 'boleto' : 'other')
                        if (isPix && (data.pixQrCode || data.pixQrCodeBase64)) {
                            setPixData({ qrCode: data.pixQrCode, qrCodeBase64: data.pixQrCodeBase64 })
                        }
                        if (isBoleto && (data.boletoUrl || data.ticketUrl)) {
                            setBoletoUrl(data.boletoUrl || data.ticketUrl)
                        }
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

    if (pendingOrderId) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {pendingStatus === 'pix' && pixData && (
                    <div style={{
                        padding: '24px',
                        background: 'var(--bg-card2)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 16,
                    }}>
                        <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Pix gerado com sucesso!</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Escaneie o QR Code abaixo ou copie o código Pix para pagar.</p>
                        {pixData.qrCodeBase64 && (
                            <img
                                src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                                alt="QR Code Pix"
                                style={{ width: 220, height: 220, borderRadius: 8, background: '#fff', padding: 8 }}
                            />
                        )}
                        {pixData.qrCode && (
                            <div style={{ width: '100%', maxWidth: 400 }}>
                                <textarea
                                    readOnly
                                    value={pixData.qrCode}
                                    style={{
                                        width: '100%',
                                        padding: 10,
                                        borderRadius: 8,
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg-card)',
                                        color: 'var(--text)',
                                        fontSize: '0.75rem',
                                        resize: 'none',
                                        height: 60,
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(pixData.qrCode || '')
                                        setPixCopied(true)
                                        toast.success('Código Pix copiado!')
                                        setTimeout(() => setPixCopied(false), 3000)
                                    }}
                                    className="btn btn-primary"
                                    style={{ marginTop: 8, width: '100%' }}
                                >
                                    {pixCopied ? 'Copiado!' : 'Copiar código Pix'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {pendingStatus === 'boleto' && (
                    <div style={{
                        padding: '24px',
                        background: 'var(--bg-card2)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 16,
                    }}>
                        <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Boleto gerado com sucesso!</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Clique abaixo para visualizar e pagar o boleto.</p>
                        {boletoUrl && (
                            <a href={boletoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', maxWidth: 300 }}>
                                Abrir Boleto
                            </a>
                        )}
                    </div>
                )}

                {pendingStatus === 'other' && (
                    <div style={{
                        padding: '20px',
                        background: 'var(--bg-card2)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        textAlign: 'center',
                    }}>
                        <p style={{ fontWeight: 700 }}>Pagamento em processamento...</p>
                    </div>
                )}

                <div style={{
                    padding: '16px 20px',
                    background: 'var(--bg-card2)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Seu pedido foi registrado. O status será atualizado automaticamente após a confirmação do pagamento.
                    </p>
                    <Link href={`/pedido/${pendingOrderId}`} className="btn btn-secondary" style={{ fontSize: '0.85rem', width: 'fit-content' }}>
                        Ver meu pedido
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div>
            <Payment
                initialization={initialization}
                customization={customization as any}
                onSubmit={onSubmit}
                onReady={onReady}
                onError={onError}
            />
        </div>
    )
}
