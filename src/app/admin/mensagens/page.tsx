'use client'

import { useState, useEffect, useCallback } from 'react'
import { Mail, MailOpen, Trash2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'

interface ContactMessage {
    id: string
    name: string
    email: string
    subject?: string | null
    message: string
    read: boolean
    createdAt: string
}

export default function AdminMensagensPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState<string | null>(null)
    const LIMIT = 20

    const fetchMessages = useCallback(async () => {
        setLoading(true)
        const res = await fetch(`/api/admin/messages?page=${page}&limit=${LIMIT}`)
        const data = await res.json()
        setMessages(data.messages || [])
        setTotal(data.total || 0)
        setLoading(false)
    }, [page])

    useEffect(() => { fetchMessages() }, [fetchMessages])

    const pages = Math.ceil(total / LIMIT)
    const unread = messages.filter(m => !m.read).length

    const toggleExpand = async (msg: ContactMessage) => {
        if (expanded === msg.id) {
            setExpanded(null)
            return
        }
        setExpanded(msg.id)
        if (!msg.read) {
            await fetch('/api/admin/messages', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: msg.id, read: true }),
            })
            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m))
        }
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('Excluir esta mensagem?')) return
        await fetch('/api/admin/messages', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        })
        setMessages(prev => prev.filter(m => m.id !== id))
        setTotal(prev => prev - 1)
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Mensagens de Contato</h1>
                    {unread > 0 && <span className="badge badge-blue">{unread} não lida{unread > 1 ? 's' : ''}</span>}
                </div>
                <button className="btn btn-secondary" onClick={fetchMessages} style={{ flexShrink: 0 }}>
                    <RefreshCw size={15} /> Atualizar
                </button>
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                    <div style={{ padding: 10, borderRadius: 10, background: 'rgba(99,102,241,0.15)' }}>
                        <Mail size={20} color="#6366f1" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total de Mensagens</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{total}</p>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                    <div style={{ padding: 10, borderRadius: 10, background: 'rgba(234,179,8,0.15)' }}>
                        <MailOpen size={20} color="#eab308" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Não Lidas</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{unread}</p>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Carregando...</div>
                ) : messages.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Mail size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                        <p>Nenhuma mensagem ainda.</p>
                    </div>
                ) : (
                    <div>
                        {messages.map((msg) => (
                            <div key={msg.id} style={{
                                borderBottom: '1px solid var(--border)',
                                background: msg.read ? 'transparent' : 'rgba(99,102,241,0.04)',
                            }}>
                                <div
                                    onClick={() => toggleExpand(msg)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
                                        cursor: 'pointer', transition: 'background 0.15s',
                                    }}
                                >
                                    <div style={{ flexShrink: 0 }}>
                                        {msg.read
                                            ? <MailOpen size={18} color="var(--text-muted)" />
                                            : <Mail size={18} color="#6366f1" />}
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: msg.read ? 500 : 700, fontSize: '0.9rem' }}>{msg.name}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{msg.email}</span>
                                            {!msg.read && <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>Nova</span>}
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {msg.subject ? <><strong>{msg.subject}</strong> — </> : ''}{msg.message}
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                            {new Date(msg.createdAt).toLocaleDateString('pt-BR')}
                                        </span>
                                        <button
                                            onClick={(e) => handleDelete(msg.id, e)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: 4, borderRadius: 4 }}
                                            title="Excluir"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                        {expanded === msg.id ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                                    </div>
                                </div>

                                {expanded === msg.id && (
                                    <div style={{ padding: '0 20px 20px 50px', borderTop: '1px solid var(--border)' }}>
                                        {msg.subject && (
                                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                                                <strong>Assunto:</strong> {msg.subject}
                                            </p>
                                        )}
                                        <div style={{
                                            background: 'var(--bg-card2)', borderRadius: 8, padding: '14px 16px',
                                            fontSize: '0.88rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text)',
                                            border: '1px solid var(--border)', marginTop: 8,
                                        }}>
                                            {msg.message}
                                        </div>
                                        <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                                            <a
                                                href={`mailto:${msg.email}?subject=Re: ${msg.subject || 'Contato'}`}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                                    padding: '8px 16px', background: 'var(--primary)', color: '#fff',
                                                    borderRadius: 6, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600,
                                                }}
                                            >
                                                <Mail size={14} /> Responder por Email
                                            </a>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', alignSelf: 'center' }}>
                                                {new Date(msg.createdAt).toLocaleString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
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
