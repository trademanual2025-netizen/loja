'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, ExternalLink, Clock, QrCode } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
    gateway: string
    gatewayData: Record<string, any>
    createdAt: string
}

export function PaymentInfo({ gateway, gatewayData, createdAt }: Props) {
    const [copied, setCopied] = useState(false)
    const [timeLeft, setTimeLeft] = useState('')
    const [expired, setExpired] = useState(false)

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
                setTimeLeft('Expirado')
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
            toast.success('Código copiado!')
            setTimeout(() => setCopied(false), 3000)
        } catch {
            toast.error('Erro ao copiar')
        }
    }

    if (isPix) {
        return (
            <div className="card" style={{ textAlign: 'left', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <QrCode size={20} color="var(--primary)" />
                    <h3 style={{ fontWeight: 700 }}>Pagamento via Pix</h3>
                </div>

                {gatewayData.pixQrCodeBase64 && (
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

                {gatewayData.pixQrCode && (
                    <div style={{ marginBottom: 16 }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>Ou copie o código Pix:</p>
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
                                {copied ? 'Copiado' : 'Copiar'}
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
                    }}>
                        <Clock size={15} />
                        {expired ? 'QR Code expirado. Faça um novo pedido.' : `Expira em ${timeLeft}`}
                    </div>
                )}

                {!timeLeft && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Abra o app do seu banco, escaneie o QR Code ou cole o código Pix para pagar.
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
                    <h3 style={{ fontWeight: 700 }}>Pagamento via Boleto</h3>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
                    O boleto pode levar até 3 dias úteis para ser compensado após o pagamento.
                </p>

                {(gatewayData.boletoUrl || gatewayData.ticketUrl) && (
                    <a
                        href={gatewayData.boletoUrl || gatewayData.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', marginBottom: 16 }}
                    >
                        <ExternalLink size={16} />
                        Abrir Boleto
                    </a>
                )}

                {timeLeft && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                        borderRadius: 8, fontSize: '0.85rem', fontWeight: 600,
                        background: expired ? 'rgba(239,68,68,0.08)' : 'rgba(234,179,8,0.08)',
                        color: expired ? '#ef4444' : '#eab308',
                        border: `1px solid ${expired ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)'}`,
                    }}>
                        <Clock size={15} />
                        {expired ? 'Boleto vencido. Faça um novo pedido.' : `Vence em ${timeLeft}`}
                    </div>
                )}
            </div>
        )
    }

    if (isCard && gatewayData.statusDetail) {
        const detail = getStatusDetailLabel(gatewayData.statusDetail)
        const isAnalysis = gatewayData.statusDetail.includes('pending')

        return (
            <div className="card" style={{ textAlign: 'left', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Clock size={20} color={isAnalysis ? '#eab308' : '#ef4444'} />
                    <h3 style={{ fontWeight: 700 }}>Pagamento via Cartão</h3>
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
                Aguardando confirmação do pagamento. Assim que for confirmado, o status será atualizado automaticamente.
            </p>
        </div>
    )
}

function getStatusDetailLabel(detail: string): string {
    const labels: Record<string, string> = {
        accredited: 'Pagamento aprovado',
        pending_contingency: 'Pagamento em processamento',
        pending_review_manual: 'Seu pagamento está em análise manual. Isso pode levar até 2 dias úteis.',
        pending_waiting_payment: 'Aguardando pagamento',
        pending_waiting_transfer: 'Aguardando transferência',
        cc_rejected_bad_filled_card_number: 'Número do cartão incorreto',
        cc_rejected_bad_filled_date: 'Data de validade incorreta',
        cc_rejected_bad_filled_other: 'Dados do cartão incorretos',
        cc_rejected_bad_filled_security_code: 'Código de segurança incorreto',
        cc_rejected_blacklist: 'Cartão não autorizado pela operadora',
        cc_rejected_call_for_authorize: 'Ligue para a operadora do cartão para autorizar o pagamento',
        cc_rejected_card_disabled: 'Cartão desativado. Entre em contato com a operadora',
        cc_rejected_card_error: 'Erro no cartão. Tente outro cartão ou forma de pagamento',
        cc_rejected_duplicated_payment: 'Pagamento duplicado detectado',
        cc_rejected_high_risk: 'Pagamento recusado por segurança. Tente outra forma de pagamento',
        cc_rejected_insufficient_amount: 'Saldo insuficiente no cartão',
        cc_rejected_invalid_installments: 'Número de parcelas não suportado',
        cc_rejected_max_attempts: 'Limite de tentativas excedido. Use outro cartão',
        cc_rejected_other_reason: 'Pagamento recusado pela operadora do cartão',
    }
    return labels[detail] || detail
}
