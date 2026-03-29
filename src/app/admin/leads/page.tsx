'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Users, ShoppingBag, Loader2, Download, ChevronDown, ChevronUp, ShoppingCart, RefreshCw, CreditCard } from 'lucide-react'

interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    image?: string | null
    variantName?: string | null
}

interface Lead {
    id: string
    source: string
    createdAt: string
    user: { name: string; email: string; phone?: string; cpf?: string; orders?: { id: string; status: string }[]; cartItems?: CartItem[] }
}

const LIMIT = 20
const REFRESH_INTERVAL = 30_000

export default function AdminLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [expandedLead, setExpandedLead] = useState<string | null>(null)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const fetchLeads = useCallback(async (silent = false) => {
        if (!silent) setLoading(true)
        else setRefreshing(true)
        try {
            const res = await fetch(`/api/admin/leads?page=${page}&limit=${LIMIT}`)
            const data = await res.json()
            setLeads(data.leads || [])
            setTotal(data.total || 0)
            setLastUpdated(new Date())
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [page])

    useEffect(() => {
        fetchLeads()
    }, [fetchLeads])

    useEffect(() => {
        timerRef.current = setInterval(() => fetchLeads(true), REFRESH_INTERVAL)
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [fetchLeads])

    const pages = Math.ceil(total / LIMIT)

    const exportCSV = () => {
        const rows = [['Nome', 'Email', 'Telefone', 'CPF', 'Origem', 'Produtos no Carrinho', 'Data']]
        leads.forEach(l => {
            const cartStr = (l.user.cartItems || []).map(c => `${c.name} x${c.quantity}`).join('; ')
            rows.push([l.user.name, l.user.email, l.user.phone || '', l.user.cpf || '', l.source, cartStr, new Date(l.createdAt).toLocaleDateString('pt-BR')])
        })
        const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
        URL.revokeObjectURL(url)
    }

    const toggleExpand = (id: string) => {
        setExpandedLead(prev => prev === id ? null : id)
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Leads</h1>
                    <span className="badge badge-blue">{total} leads</span>
                    {lastUpdated && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Atualizado {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => fetchLeads(true)}
                        disabled={refreshing}
                        style={{ flexShrink: 0 }}
                    >
                        <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                        Atualizar
                    </button>
                    <button className="btn btn-secondary" onClick={exportCSV} style={{ flexShrink: 0 }}>
                        <Download size={15} /> Exportar CSV
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                    <div style={{ padding: 10, borderRadius: 10, background: 'rgba(168,85,247,0.15)' }}><Users size={20} color="#a855f7" /></div>
                    <div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total de Leads</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{total}</p>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                    <div style={{ padding: 10, borderRadius: 10, background: 'rgba(251,191,36,0.15)' }}><CreditCard size={20} color="#fbbf24" /></div>
                    <div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Iniciou Checkout</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{leads.filter(l => (l.user.orders?.length || 0) > 0).length}</p>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                    <div style={{ padding: 10, borderRadius: 10, background: 'rgba(34,197,94,0.15)' }}><ShoppingBag size={20} color="#22c55e" /></div>
                    <div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Convertidos</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{leads.filter(l => l.user.orders?.some(o => o.status === 'PAID' || o.status === 'DELIVERED')).length}</p>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} /></div>
                ) : leads.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Users size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                        <p>Nenhum lead ainda.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-card2)', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    {['Nome', 'Email', 'Telefone', 'Carrinho', 'Comprou?', 'Data', ''].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '12px 16px' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map(l => {
                                    const cartItems = l.user.cartItems || []
                                    const hasCart = cartItems.length > 0
                                    const isExpanded = expandedLead === l.id
                                    const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)

                                    return (
                                        <tr key={l.id} style={{ borderTop: '1px solid var(--border)', fontSize: '0.87rem' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: 600, verticalAlign: 'top' }}>{l.user.name}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)', verticalAlign: 'top' }}>{l.user.email}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.83rem', verticalAlign: 'top' }}>{l.user.phone || '—'}</td>
                                            <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                                                {hasCart ? (
                                                    <div>
                                                        <button
                                                            onClick={() => toggleExpand(l.id)}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: 6,
                                                                background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                                                                borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                                                                color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600
                                                            }}
                                                        >
                                                            <ShoppingCart size={13} />
                                                            {cartItems.length} {cartItems.length === 1 ? 'produto' : 'produtos'}
                                                            {' · '}R$ {cartTotal.toFixed(2).replace('.', ',')}
                                                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                                        </button>
                                                        {isExpanded && (
                                                            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                                {cartItems.map((item, idx) => (
                                                                    <div key={idx} style={{
                                                                        display: 'flex', alignItems: 'center', gap: 8,
                                                                        background: 'var(--bg-card2)', borderRadius: 6, padding: '6px 10px',
                                                                        fontSize: '0.78rem'
                                                                    }}>
                                                                        {item.image && (
                                                                            <img src={item.image} alt="" style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }} />
                                                                        )}
                                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                                            <p style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                                {item.name}
                                                                                {item.variantName && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> ({item.variantName})</span>}
                                                                            </p>
                                                                        </div>
                                                                        <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>x{item.quantity}</span>
                                                                        <span style={{ fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                                                                            R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                                <div style={{
                                                                    textAlign: 'right', fontSize: '0.78rem', fontWeight: 700,
                                                                    color: 'var(--primary)', paddingTop: 4
                                                                }}>
                                                                    Total: R$ {cartTotal.toFixed(2).replace('.', ',')}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Vazio</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                                                {l.user.orders?.some(o => o.status === 'PAID' || o.status === 'DELIVERED')
                                                    ? <span className="badge badge-green">Sim</span>
                                                    : (l.user.orders?.length || 0) > 0
                                                        ? <span className="badge badge-yellow">Checkout</span>
                                                        : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Não</span>}
                                            </td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem', verticalAlign: 'top' }}>{new Date(l.createdAt).toLocaleDateString('pt-BR')}</td>
                                            <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                                                <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>{l.source}</span>
                                            </td>
                                        </tr>
                                    )
                                })}
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
