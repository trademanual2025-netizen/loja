'use client'

import { useState, useEffect } from 'react'
import { Users, ShoppingBag, Loader2, Download } from 'lucide-react'

interface Lead {
    id: string
    source: string
    createdAt: string
    user: { name: string; email: string; phone?: string; cpf?: string; orders?: { id: string }[] }
}

export default function AdminLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const LIMIT = 20

    const fetchLeads = async () => {
        setLoading(true)
        const res = await fetch(`/api/admin/leads?page=${page}&limit=${LIMIT}`)
        const data = await res.json()
        setLeads(data.leads || [])
        setTotal(data.total || 0)
        setLoading(false)
    }

    useEffect(() => { fetchLeads() }, [page])

    const pages = Math.ceil(total / LIMIT)

    const exportCSV = () => {
        const rows = [['Nome', 'Email', 'Telefone', 'CPF', 'Origem', 'Data']]
        leads.forEach(l => rows.push([l.user.name, l.user.email, l.user.phone || '', l.user.cpf || '', l.source, new Date(l.createdAt).toLocaleDateString('pt-BR')]))
        const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Leads</h1>
                    <span className="badge badge-blue">{total} leads</span>
                </div>
                <button className="btn btn-secondary" onClick={exportCSV} style={{ flexShrink: 0 }}><Download size={15} /> Exportar CSV</button>
            </div>

            {/* Stats row */}
            <div className="grid-2" style={{ marginBottom: 20 }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                    <div style={{ padding: 10, borderRadius: 10, background: 'rgba(168,85,247,0.15)' }}><Users size={20} color="#a855f7" /></div>
                    <div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total de Leads</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{total}</p>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                    <div style={{ padding: 10, borderRadius: 10, background: 'rgba(34,197,94,0.15)' }}><ShoppingBag size={20} color="#22c55e" /></div>
                    <div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Convertidos</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{leads.filter(l => (l.user.orders?.length || 0) > 0).length}</p>
                    </div>
                </div>
            </div>

            {/* Table */}
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
                                    {['Nome', 'Email', 'Telefone', 'CPF', 'Origem', 'Comprou?', 'Data'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '12px 16px' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map(l => (
                                    <tr key={l.id} style={{ borderTop: '1px solid var(--border)', fontSize: '0.87rem' }}>
                                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{l.user.name}</td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{l.user.email}</td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.83rem' }}>{l.user.phone || '—'}</td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.83rem' }}>{l.user.cpf || '—'}</td>
                                        <td style={{ padding: '12px 16px' }}><span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>{l.source}</span></td>
                                        <td style={{ padding: '12px 16px' }}>
                                            {(l.user.orders?.length || 0) > 0
                                                ? <span className="badge badge-green">Sim</span>
                                                : <span className="badge badge-yellow">Não</span>}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(l.createdAt).toLocaleDateString('pt-BR')}</td>
                                    </tr>
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
