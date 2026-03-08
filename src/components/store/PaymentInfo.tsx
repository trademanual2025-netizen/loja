'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, ExternalLink, Clock, QrCode, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart'
import type { Dictionary } from '@/lib/i18n'

interface CartItem {
    id: string
    name: string
    slug: string
    price: number
    image: string
    quantity: number
    variantId?: string
    variantName?: string
}

interface Props {
    gateway: string
    gatewayData: Record<string, any>
    createdAt: string
    orderId?: string
    orderItems?: CartItem[]
    dict: Dictionary
}

export function PaymentInfo({ gateway, gatewayData, createdAt, orderId, orderItems, dict }: Props) {
    const [copied, setCopied] = useState(false)
    const [timeLeft, setTimeLeft] = useState('')
    const [expired, setExpired] = useState(false)
    const [regenerating, setRegenerating] = useState(false)
    const router = useRouter()
    const { setItems } = useCart()

    const paymentMethod = gatewayData.paymentMethod || ''
    const isPix = paymentMethod === 'pix'
    const isBoleto = paymentMethod === 'boleto'
    const isCard = paymentMethod?.startsWith('cc_') || ['visa', 'master', 'mastercard', 'amex', 'elo', 'hipercard'].includes(paymentMethod)

    useEffect(() => {
        if (!gatewayData.expiresAt) return

        const update = () => {
            const now = new Date().getTime()
            const exp = new Date(gatewayData.expiresAt).getTime()
            const diff = exp - now

            if (diff <= 0) {
                setExpired(true)
                setTimeLeft(dict.paymentInfo.expired)
                return
            }

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}min`)
            } else if (minutes > 0) {
                setTimeLeft(`${minutes}min ${seconds}s`)
            } else {
                setTimeLeft(`${seconds}s`)
            }
        }

        update()
        const interval = setInterval(update, 1000)
        return () => clearInterval(interval)
    }, [gatewayData.expiresAt])

    async function copyToClipboard(text: string) {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            toast.success(dict.paymentInfo.codeCopied)
            setTimeout(() => setCopied(false), 3000)
        } catch {
            toast.error(dict.paymentInfo.copyError)
        }
    }

    async function handleRegenerate() {
        if (!orderId) return
        setRegenerating(true)
        try {
            const res = await fetch('/api/orders/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId }),
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || dict.paymentInfo.cancelError)
                setRegenerating(false)
                return
            }
            setItems(data.cartItems || orderItems || [])
            toast.success(dict.paymentInfo.redirectingCheckout)
            router.push('/checkout')
        } catch {
            toast.error(dict.paymentInfo.processingError)
            setRegenerating(false)
        }
    }

    if (isPix) {
        return (
            <div className="card" style={{ textAlign: 'left', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <QrCode size={20} color="var(--primary)" />
                    <h3 style={{ fontWeight: 700 }}>{dict.paymentInfo.pixTitle}</h3>
                </div>

                {!expired && gatewayData.pixQrCodeBase64 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                        <div style={{ padding: 16, background: 'white', borderRadius: 12 }}>
                            <img
                                src={`data:image/png;base64,${gatewayData.pixQrCodeBase64}`}
                                alt="QR Code Pix"
                                style={{ width: 200, height: 200 }}
                            />
                        </div>
                    </div>
                )}

                {!expired && gatewayData.pixQrCode && (
                    <div style={{ marginBottom: 16 }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>{dict.paymentInfo.pixCopyLabel}</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                readOnly
                                value={gatewayData.pixQrCode}
                                style={{
                                    flex: 1, padding: '10px 12px', borderRadius: 8,
                                    border: '1px solid var(--border)', background: 'var(--bg-card2)',
                                    color: 'var(--text-body)', fontSize: '0.78rem',
                                    fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}
                            />
                            <button
                                onClick={() => copyToClipboard(gatewayData.pixQrCode)}
                                className="btn btn-primary"
                                style={{ padding: '10px 16px', gap: 6, flexShrink: 0 }}
                            >
                                {copied ? <Check size={15} /> : <Copy size={15} />}
                                {copied ? dict.paymentInfo.copiedBtn : dict.paymentInfo.copyBtn}
                            </button>
                        </div>
                    </div>
                )}

                {timeLeft && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                        borderRadius: 8, fontSize: '0.85rem', fontWeight: 600,
                        background: expired ? 'rgba(239,68,68,0.08)' : 'rgba(234,179,8,0.08)',
                        color: expired ? '#ef4444' : '#eab308',
                        border: `1px solid ${expired ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)'}`,
                        marginBottom: expired && orderId ? 12 : 0,
                    }}>
                        <Clock size={15} />
                        {expired ? dict.paymentInfo.qrExpired : `${dict.paymentInfo.expiresIn} ${timeLeft}`}
                    </div>
                )}

                {expired && orderId && (
                    <button
                        onClick={handleRegenerate}
                        disabled={regenerating}
                        className="btn btn-primary"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                        {regenerating
                            ? <span className="spinner" style={{ width: 16, height: 16 }} />
                            : <RefreshCw size={16} />}
                        {regenerating ? dict.paymentInfo.wait : dict.paymentInfo.generateNewOrder}
                    </button>
                )}

                {!timeLeft && !expired && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {dict.paymentInfo.pixInstructions}
                    </p>
                )}
            </div>
        )
    }

    if (isBoleto) {
        return (
            <div className="card" style={{ textAlign: 'left', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <ExternalLink size={20} color="var(--primary)" />
                    <h3 style={{ fontWeight: 700 }}>{dict.paymentInfo.boletoTitle}</h3>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
                    {dict.paymentInfo.boletoProcessing}
                </p>

                {!expired && (gatewayData.boletoUrl || gatewayData.ticketUrl) && (
                    <a
                        href={gatewayData.boletoUrl || gatewayData.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', marginBottom: 16 }}
                    >
                        <ExternalLink size={16} />
                        {dict.paymentInfo.openBoleto}
                    </a>
                )}

                {timeLeft && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                        borderRadius: 8, fontSize: '0.85rem', fontWeight: 600,
                        background: expired ? 'rgba(239,68,68,0.08)' : 'rgba(234,179,8,0.08)',
                        color: expired ? '#ef4444' : '#eab308',
                        border: `1px solid ${expired ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)'}`,
                        marginBottom: expired && orderId ? 12 : 0,
                    }}>
                        <Clock size={15} />
                        {expired ? dict.paymentInfo.boletoExpired : `${dict.paymentInfo.dueIn} ${timeLeft}`}
                    </div>
                )}

                {expired && orderId && (
                    <button
                        onClick={handleRegenerate}
                        disabled={regenerating}
                        className="btn btn-primary"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                        {regenerating
                            ? <span className="spinner" style={{ width: 16, height: 16 }} />
                            : <RefreshCw size={16} />}
                        {regenerating ? dict.paymentInfo.wait : dict.paymentInfo.generateNewOrder}
                    </button>
                )}
            </div>
        )
    }

    if (isCard && gatewayData.statusDetail) {
        const detail = getStatusDetailLabel(gatewayData.statusDetail, dict)
        const isAnalysis = gatewayData.statusDetail.includes('pending')

        return (
            <div className="card" style={{ textAlign: 'left', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Clock size={20} color={isAnalysis ? '#eab308' : '#ef4444'} />
                    <h3 style={{ fontWeight: 700 }}>{dict.paymentInfo.cardTitle}</h3>
                </div>
                <div style={{
                    padding: '12px 14px', borderRadius: 8, fontSize: '0.88rem',
                    background: isAnalysis ? 'rgba(234,179,8,0.08)' : 'rgba(239,68,68,0.08)',
                    color: isAnalysis ? '#eab308' : '#ef4444',
                    border: `1px solid ${isAnalysis ? 'rgba(234,179,8,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    fontWeight: 500,
                }}>
                    {detail}
                </div>
            </div>
        )
    }

    return (
        <div className="card" style={{ textAlign: 'left', marginBottom: 24 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                {dict.paymentInfo.awaitingConfirmation}
            </p>
        </div>
    )
}

function getStatusDetailLabel(detail: string, dict: Dictionary): string {
    const labels: Record<string, string> = dict.paymentStatus as Record<string, string>
    return labels[detail] || detail
}
