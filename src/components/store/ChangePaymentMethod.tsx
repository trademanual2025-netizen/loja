'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/lib/cart'

interface Props {
    orderId: string
    orderItems: {
        id: string
        name: string
        slug: string
        price: number
        image: string
        quantity: number
        variantId?: string
        variantName?: string
    }[]
}

export function ChangePaymentMethod({ orderId, orderItems }: Props) {
    const [loading, setLoading] = useState(false)
    const [confirming, setConfirming] = useState(false)
    const router = useRouter()
    const { setItems } = useCart()

    async function handleChange() {
        if (!confirming) {
            setConfirming(true)
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/orders/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId }),
            })

            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || 'Erro ao cancelar pedido.')
                setLoading(false)
                setConfirming(false)
                return
            }

            setItems(data.cartItems || orderItems)
            toast.success('Pedido cancelado. Escolha outra forma de pagamento.')
            router.push('/checkout')
        } catch {
            toast.error('Erro ao processar. Tente novamente.')
            setLoading(false)
            setConfirming(false)
        }
    }

    return (
        <div style={{ marginBottom: 24 }}>
            {!confirming ? (
                <button
                    onClick={handleChange}
                    className="btn"
                    style={{
                        width: '100%',
                        padding: '14px 20px',
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--text-body)',
                        borderRadius: 10,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        transition: 'all 0.2s',
                    }}
                >
                    <RefreshCw size={16} />
                    Alterar forma de pagamento
                </button>
            ) : (
                <div className="card" style={{
                    border: '1px solid rgba(234,179,8,0.3)',
                    background: 'rgba(234,179,8,0.04)',
                    padding: '16px 20px',
                }}>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', marginBottom: 14, lineHeight: 1.6 }}>
                        Este pedido será <strong>cancelado</strong> e os mesmos produtos serão adicionados ao seu carrinho para que você possa finalizar com outra forma de pagamento.
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            onClick={handleChange}
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        >
                            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <RefreshCw size={15} />}
                            {loading ? 'Cancelando...' : 'Confirmar e ir ao checkout'}
                        </button>
                        <button
                            onClick={() => setConfirming(false)}
                            disabled={loading}
                            className="btn"
                            style={{ padding: '12px 20px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                            Voltar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
