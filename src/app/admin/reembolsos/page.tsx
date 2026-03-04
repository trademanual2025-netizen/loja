'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2, Send, Check, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

interface RefundMessage { id: string; authorType: string; content: string; createdAt: string }
interface RefundOrder {
    id: string; total: number; deliveredAt: string | null
    user: { name: string; email: string }
    items: { quantity: number; price: number; product: { name: string } }[]
}
interface Refund {
    id: string; orderId: string; userId: string; status: string; reason: string; createdAt: string
    messages: RefundMessage[]
    order: RefundOrder
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Aguardando', color: '#f59e0b' },
    APPROVED: { label: 'Aprovado', color: '#22c55e' },
    REJECTED: { label: 'Recusado', color: '#ef4444' },
}

export default function AdminReembolsosPage() {
    const [refunds, setRefunds] = useState<Refund[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Record<string, RefundMessage[]>>({})
    const [msgInput, setMsgInput] = useState<Record<string, string>>({})
    const [sendingMsg, setSendingMsg] = useState<string | null>(null)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState('')
    const chatRefs = useRef<Record<string, HTMLDivElement | null>>({})

    async function load() {
        setLoading(true)
        const res = await fetch('/api/admin/refunds')
        const data = await res.json()
        setRefunds(data)
        const msgMap: Record<string, RefundMessage[]> = {}
        for (const r of data) msgMap[r.id] = r.messages
        setMessages(msgMap)
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    useEffect(() => {
        if (expandedId && chatRefs.current[expandedId]) {
            const el = chatRefs.current[expandedId]
            if (el) el.scrollTop = el.scrollHeight
        }
    }, [expandedId, messages])

    async function sendMessage(refundId: string) {
        const content = msgInput[refundId]?.trim()
        if (!content) return
        setSendingMsg(refundId)
        const res = await fetch(`/api/admin/refunds/${refundId}/messages`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }),
        })
        if (res.ok) {
            const msg = await res.json()
            setMessages(p => ({ ...p, [refundId]: [...(p[refundId] || []), msg] }))
            setMsgInput(p => ({ ...p, [refundId]: '' }))
        } else toast.error('Erro ao enviar mensagem.')
        setSendingMsg(null)
    }

    async function updateStatus(refundId: string, status: 'APPROVED' | 'REJECTED') {
        setUpdatingId(refundId)
        const res = await fetch(`/api/admin/refunds/${refundId}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
        })
        if (res.ok) {
            toast.success(status === 'APPROVED' ? 'Reembolso aprovado!' : 'Reembolso recusado.')
            load()
        } else toast.error('Erro ao atualizar status.')
        setUpdatingId(null)
    }

    const filtered = statusFilter ? refunds.filter(r => r.status === statusFilter) : refunds

    const daysLeft = (deliveredAt: string | null) => {
        if (!deliveredAt) return null
        const diff = 7 - (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24)
        return Math.max(0, Math.ceil(diff))
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Reembolsos</h1>
                <button onClick={load} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <RotateCcw size={14} /> Atualizar
                </button>
            </div>

            <div className="card" style={{ marginBottom: 18, padding: '12px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filtrar:</span>
                {[['', 'Todos'], ['PENDING', 'Aguardando'], ['APPROVED', 'Aprovados'], ['REJECTED', 'Recusados']].map(([v, l]) => (
                    <button key={v} onClick={() => setStatusFilter(v)}
                        style={{ padding: '5px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: '1px solid', borderColor: statusFilter === v ? 'var(--primary)' : 'var(--border)', background: statusFilter === v ? 'rgba(99,102,241,0.15)' : 'transparent', color: statusFilter === v ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {l}
                    </button>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{filtered.length} solicitação{filtered.length !== 1 ? 'ões' : ''}</span>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite', display: 'inline-block', color: 'var(--text-muted)' }} /></div>
            ) : filtered.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Nenhuma solicitação de reembolso encontrada.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filtered.map(refund => {
                        const st = STATUS_LABELS[refund.status] || { label: refund.status, color: 'var(--text-muted)' }
                        const isOpen = expandedId === refund.id
                        const dl = daysLeft(refund.order.deliveredAt)

                        return (
                            <div key={refund.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', flexWrap: 'wrap' }}
                                    onClick={() => setExpandedId(isOpen ? null : refund.id)}>
                                    <div style={{ flex: 1, minWidth: 220 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                            <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>#{refund.orderId.slice(-8).toUpperCase()}</span>
                                            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: `${st.color}20`, color: st.color }}>{st.label}</span>
                                            {refund.status === 'PENDING' && dl !== null && (
                                                <span style={{ fontSize: '0.72rem', color: dl <= 1 ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>{dl}d restantes</span>
                                            )}
                                        </div>
                                        <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{refund.order.user.name}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{refund.order.user.email} · R$ {refund.order.total.toFixed(2).replace('.', ',')}</p>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <p>{new Date(refund.createdAt).toLocaleDateString('pt-BR')}</p>
                                        <p style={{ marginTop: 2 }}>{messages[refund.id]?.length || 0} mensagen{(messages[refund.id]?.length || 0) !== 1 ? 's' : ''}</p>
                                    </div>
                                    {isOpen ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                                </div>

                                {isOpen && (
                                    <div style={{ borderTop: '1px solid var(--border)' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                                            {/* Left: details + actions */}
                                            <div style={{ padding: '20px', borderRight: '1px solid var(--border)' }}>
                                                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Motivo do Reembolso</p>
                                                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, padding: '12px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 16 }}>{refund.reason}</p>

                                                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Itens do Pedido</p>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                                                    {refund.order.items.map((item, i) => (
                                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '8px 10px', background: 'var(--bg)', borderRadius: 6 }}>
                                                            <span>{item.product.name} × {item.quantity}</span>
                                                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                                                        </div>
                                                    ))}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700, padding: '8px 10px', borderTop: '1px solid var(--border)', marginTop: 4 }}>
                                                        <span>Total</span>
                                                        <span style={{ color: 'var(--primary)' }}>R$ {refund.order.total.toFixed(2).replace('.', ',')}</span>
                                                    </div>
                                                </div>

                                                {refund.status === 'PENDING' && (
                                                    <div style={{ display: 'flex', gap: 10 }}>
                                                        <button
                                                            onClick={() => updateStatus(refund.id, 'APPROVED')}
                                                            disabled={updatingId === refund.id}
                                                            className="btn btn-primary"
                                                            style={{ flex: 1, gap: 6, background: '#22c55e', borderColor: '#22c55e' }}>
                                                            {updatingId === refund.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                                                            Aprovar
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(refund.id, 'REJECTED')}
                                                            disabled={updatingId === refund.id}
                                                            className="btn"
                                                            style={{ flex: 1, gap: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }}>
                                                            <X size={14} /> Recusar
                                                        </button>
                                                    </div>
                                                )}
                                                {refund.status !== 'PENDING' && (
                                                    <div style={{ padding: '10px 14px', borderRadius: 8, background: `${st.color}15`, border: `1px solid ${st.color}40`, fontSize: '0.85rem', color: st.color, fontWeight: 600 }}>
                                                        {refund.status === 'APPROVED' ? '✓ Reembolso aprovado — pedido marcado como Reembolsado' : '✗ Reembolso recusado — pedido voltou para Entregue'}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right: chat */}
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px 20px 12px' }}>Chat com o Cliente</p>
                                                <div
                                                    ref={el => { chatRefs.current[refund.id] = el }}
                                                    style={{ flex: 1, minHeight: 200, maxHeight: 300, overflowY: 'auto', padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    {(messages[refund.id] || []).length === 0 && (
                                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', padding: '20px 0' }}>Nenhuma mensagem ainda.</p>
                                                    )}
                                                    {(messages[refund.id] || []).map(msg => (
                                                        <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.authorType === 'ADMIN' ? 'flex-end' : 'flex-start' }}>
                                                            <div style={{ maxWidth: '80%', padding: '8px 12px', borderRadius: msg.authorType === 'ADMIN' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: msg.authorType === 'ADMIN' ? 'var(--primary)' : 'var(--bg-card2)', color: msg.authorType === 'ADMIN' ? '#fff' : 'var(--text)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                                                {msg.content}
                                                            </div>
                                                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 3 }}>
                                                                {msg.authorType === 'ADMIN' ? 'Admin' : 'Cliente'} · {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                                                    <input
                                                        className="input"
                                                        placeholder="Escreva uma mensagem para o cliente..."
                                                        value={msgInput[refund.id] || ''}
                                                        onChange={e => setMsgInput(p => ({ ...p, [refund.id]: e.target.value }))}
                                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(refund.id) } }}
                                                    />
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => sendMessage(refund.id)}
                                                        disabled={sendingMsg === refund.id || !msgInput[refund.id]?.trim()}
                                                        style={{ flexShrink: 0, padding: '0 14px' }}>
                                                        {sendingMsg === refund.id ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
