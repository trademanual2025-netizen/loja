'use client'

import { useState, useEffect, Fragment } from 'react'
import { Filter, Loader2, Truck, ChevronDown, ChevronUp, Check, RotateCcw, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface OrderItem { product: { name: string }; variant?: { name: string }; quantity: number; price: number }
interface Order {
    id: string
    status: string
    subtotal: number
    discount: number
    total: number
    shippingCost: number
    gateway: string
    createdAt: string
    trackingCode: string | null
    trackingUrl: string | null
    shippingNote: string | null
    user: { name: string; email: string }
    items: OrderItem[]
}

const STATUS_LABELS: Record<string, string> = { PENDING: 'Pendente', PAID: 'Pago', CANCELLED: 'Cancelado', REFUNDED: 'Reembolsado', DELIVERED: 'Entregue', REFUND_REQUESTED: 'Reembolso Solicitado' }
const STATUS_BADGES: Record<string, string> = { PENDING: 'badge-yellow', PAID: 'badge-green', CANCELLED: 'badge-red', REFUNDED: 'badge-blue', DELIVERED: 'badge-blue', REFUND_REQUESTED: 'badge-red' }

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [savingId, setSavingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [trackingForms, setTrackingForms] = useState<Record<string, { trackingCode: string; trackingUrl: string; shippingNote: string; status: string }>>({})
    const LIMIT = 20

    const fetchOrders = async () => {
        setLoading(true)
        const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
        if (statusFilter) params.set('status', statusFilter)
        const res = await fetch(`/api/admin/orders?${params}`)
        const data = await res.json()
        setOrders(data.orders || [])
        setTotal(data.total || 0)
        setLoading(false)
    }

    useEffect(() => { fetchOrders() }, [page, statusFilter])

    const toggleExpand = (order: Order) => {
        if (expandedId === order.id) {
            setExpandedId(null)
            return
        }
        setExpandedId(order.id)
        // Pre-populate the form with existing data
        if (!trackingForms[order.id]) {
            setTrackingForms(prev => ({
                ...prev,
                [order.id]: {
                    trackingCode: order.trackingCode || '',
                    trackingUrl: order.trackingUrl || '',
                    shippingNote: order.shippingNote || '',
                    status: order.status,
                }
            }))
        }
    }

    const updateTrackingForm = (orderId: string, field: string, value: string) => {
        setTrackingForms(prev => ({ ...prev, [orderId]: { ...prev[orderId], [field]: value } }))
    }

    const saveOrderTracking = async (orderId: string) => {
        const form = trackingForms[orderId]
        if (!form) return
        setSavingId(orderId)
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: form.status,
                    trackingCode: form.trackingCode || null,
                    trackingUrl: form.trackingUrl || null,
                    shippingNote: form.shippingNote || null,
                })
            })
            if (!res.ok) throw new Error('Erro ao salvar')
            toast.success('Pedido atualizado!')
            fetchOrders()
        } catch {
            toast.error('Erro ao salvar informações do pedido.')
        } finally {
            setSavingId(null)
        }
    }

    const deleteOrder = async (orderId: string) => {
        setDeletingId(orderId)
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Erro ao excluir')
            toast.success('Pedido excluído com sucesso!')
            setConfirmDeleteId(null)
            setExpandedId(null)
            fetchOrders()
        } catch {
            toast.error('Erro ao excluir pedido.')
        } finally {
            setDeletingId(null)
        }
    }

    const pages = Math.ceil(total / LIMIT)

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Pedidos</h1>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="badge badge-blue">{total} pedidos</span>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 20, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <Filter size={16} color="var(--text-muted)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['', 'PENDING', 'PAID', 'DELIVERED', 'REFUND_REQUESTED', 'CANCELLED', 'REFUNDED'].map(s => (
                        <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
                            style={{ padding: '5px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: '1px solid', borderColor: statusFilter === s ? 'var(--primary)' : 'var(--border)', background: statusFilter === s ? 'rgba(99,102,241,0.15)' : 'transparent', color: statusFilter === s ? 'var(--primary)' : 'var(--text-muted)', transition: 'all 0.15s' }}>
                            {s === '' ? 'Todos' : STATUS_LABELS[s]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} /></div>
                ) : orders.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum pedido encontrado.</div>
                ) : (
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-card2)', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    {['Pedido', 'Cliente', 'Itens', 'Frete', 'Total', 'Status', 'Data', ''].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '12px 16px' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <Fragment key={o.id}>
                                        <tr style={{ borderTop: '1px solid var(--border)', fontSize: '0.87rem', background: expandedId === o.id ? 'var(--bg-card2)' : 'transparent' }}>
                                            <td style={{ padding: '12px 16px' }}>
                                                <p style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.78rem' }}>#{o.id.slice(-8).toUpperCase()}</p>
                                                {o.trackingCode && (
                                                    <span style={{ fontSize: '0.72rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
                                                        <Truck size={11} /> {o.trackingCode}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{o.user.name}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.user.email}</p>
                                            </td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{o.items.length} item{o.items.length !== 1 ? 's' : ''}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>R$ {(o.shippingCost ?? 0).toFixed(2).replace('.', ',')}</td>
                                            <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--primary)' }}>
                                                R$ {o.total.toFixed(2).replace('.', ',')}
                                                {(o.discount ?? 0) > 0 && (
                                                    <span title={`Desconto PIX: R$ ${o.discount.toFixed(2).replace('.', ',')}`} style={{ marginLeft: 6, fontSize: '0.7rem', background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 4, padding: '1px 5px', fontWeight: 600 }}>⚡ PIX</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}><span className={`badge ${STATUS_BADGES[o.status]}`}>{STATUS_LABELS[o.status]}</span></td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(o.createdAt).toLocaleDateString('pt-BR')}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    {(o.status === 'REFUND_REQUESTED') && (
                                                        <Link href="/admin/reembolsos"
                                                            style={{ padding: '5px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600 }}
                                                            title="Ver reembolso">
                                                            <RotateCcw size={12} /> Reembolso
                                                        </Link>
                                                    )}
                                                    <button onClick={() => toggleExpand(o)}
                                                        style={{ padding: '5px 10px', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}
                                                        title="Gerenciar pedido">
                                                        {expandedId === o.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedId === o.id && trackingForms[o.id] && (
                                            <tr key={`${o.id}-detail`} style={{ borderTop: '1px solid var(--border)' }}>
                                                <td colSpan={8} style={{ padding: '20px 24px', background: 'var(--bg-card2)' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                                        {/* Items */}
                                                        <div>
                                                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Itens do Pedido</p>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                                {o.items.map((item, i) => (
                                                                    <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px', fontSize: '0.83rem', minWidth: 200 }}>
                                                                        <p style={{ fontWeight: 600, marginBottom: 2 }}>{item.product.name}</p>
                                                                        {item.variant && <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 4 }}>{item.variant.name}</p>}
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                                                                            <span style={{ color: 'var(--text-muted)' }}>Qtd: {item.quantity}</span>
                                                                            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Tracking & Status */}
                                                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                                                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <Truck size={14} /> Informações de Envio
                                                            </p>
                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                                                                <div className="form-group" style={{ marginBottom: 0 }}>
                                                                    <label className="form-label">Status do Pedido</label>
                                                                    <select className="input" value={trackingForms[o.id].status}
                                                                        onChange={e => updateTrackingForm(o.id, 'status', e.target.value)}>
                                                                        <option value="PENDING">Pendente</option>
                                                                        <option value="PAID">Pago</option>
                                                                        <option value="DELIVERED">Entregue</option>
                                                                        <option value="REFUND_REQUESTED">Reembolso Solicitado</option>
                                                                        <option value="CANCELLED">Cancelado</option>
                                                                        <option value="REFUNDED">Reembolsado</option>
                                                                    </select>
                                                                </div>
                                                                <div className="form-group" style={{ marginBottom: 0 }}>
                                                                    <label className="form-label">Código de Rastreio</label>
                                                                    <input className="input" placeholder="Ex: BR123456789BR"
                                                                        value={trackingForms[o.id].trackingCode}
                                                                        onChange={e => updateTrackingForm(o.id, 'trackingCode', e.target.value)} />
                                                                </div>
                                                                <div className="form-group" style={{ marginBottom: 0 }}>
                                                                    <label className="form-label">URL de Rastreio (opcional)</label>
                                                                    <input className="input" placeholder="https://correios.com.br/..."
                                                                        value={trackingForms[o.id].trackingUrl}
                                                                        onChange={e => updateTrackingForm(o.id, 'trackingUrl', e.target.value)} />
                                                                </div>
                                                                <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                                                                    <label className="form-label">Observações para o Cliente</label>
                                                                    <textarea className="input" rows={2} placeholder="Ex: Seu pedido foi enviado pela transportadora X em 25/02/2026."
                                                                        value={trackingForms[o.id].shippingNote}
                                                                        onChange={e => updateTrackingForm(o.id, 'shippingNote', e.target.value)}
                                                                        style={{ resize: 'vertical' }} />
                                                                </div>
                                                            </div>
                                                            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <div>
                                                                    {confirmDeleteId === o.id ? (
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                            <span style={{ fontSize: '0.82rem', color: '#ef4444', fontWeight: 600 }}>Tem certeza? Essa ação não pode ser desfeita.</span>
                                                                            <button onClick={() => deleteOrder(o.id)} disabled={deletingId === o.id}
                                                                                style={{ padding: '6px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                                {deletingId === o.id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} />}
                                                                                Sim, excluir
                                                                            </button>
                                                                            <button onClick={() => setConfirmDeleteId(null)}
                                                                                style={{ padding: '6px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                                                Cancelar
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button onClick={() => setConfirmDeleteId(o.id)}
                                                                            style={{ padding: '6px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                            <Trash2 size={13} /> Excluir Pedido
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <button className="btn btn-primary" onClick={() => saveOrderTracking(o.id)} disabled={savingId === o.id}
                                                                    style={{ gap: 6 }}>
                                                                    {savingId === o.id ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={15} />}
                                                                    Salvar Alterações
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {pages > 1 && (
                    <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 14px' }}>Anterior</button>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{page} / {pages}</span>
                        <button className="btn btn-secondary" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} style={{ padding: '6px 14px' }}>Próxima</button>
                    </div>
                )}
            </div>
        </div>
    )
}
