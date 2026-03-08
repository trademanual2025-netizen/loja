'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { Send, ArrowLeft, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { getCookie } from 'cookies-next'
import { dictionaries, Locale, defaultLocale } from '@/lib/i18n'

interface RefundMessage { id: string; authorType: string; content: string; createdAt: string }
interface Refund { id: string; status: string; reason: string; createdAt: string; messages: RefundMessage[] }

export default function ReembolsoPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = use(params)
    const router = useRouter()

    const localeCookie = getCookie('NEXT_LOCALE') as Locale
    const locale = localeCookie && dictionaries[localeCookie] ? localeCookie : defaultLocale
    const dict = dictionaries[locale]
    const r = dict.refund

    const STATUS_INFO: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
        PENDING: { label: r.pending, color: '#f59e0b', icon: <Clock size={18} /> },
        APPROVED: { label: r.approved, color: '#22c55e', icon: <CheckCircle size={18} /> },
        REJECTED: { label: r.rejected, color: '#ef4444', icon: <XCircle size={18} /> },
    }

    const [refund, setRefund] = useState<Refund | null>(null)
    const [loading, setLoading] = useState(true)
    const [canRequest, setCanRequest] = useState(false)
    const [reason, setReason] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [msgInput, setMsgInput] = useState('')
    const [sendingMsg, setSendingMsg] = useState(false)
    const [messages, setMessages] = useState<RefundMessage[]>([])
    const chatRef = useRef<HTMLDivElement>(null)

    const dateLocale = locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-US'

    async function load() {
        const res = await fetch(`/api/user/refund/${orderId}`)
        if (res.status === 401) { router.replace('/auth?redirect=/minha-conta'); return }
        const data = await res.json()
        if (data) {
            setRefund(data)
            setMessages(data.messages || [])
        } else {
            const orderRes = await fetch('/api/user/profile')
            if (orderRes.ok) {
                const profile = await orderRes.json()
                const order = profile.orders?.find((o: any) => o.id === orderId)
                if (order?.status === 'DELIVERED' && order?.deliveredAt) {
                    const diffDays = (Date.now() - new Date(order.deliveredAt).getTime()) / (1000 * 60 * 60 * 24)
                    setCanRequest(diffDays <= 7)
                } else if (order?.status === 'DELIVERED') {
                    setCanRequest(true)
                }
            }
        }
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
    }, [messages])

    async function submitRefund() {
        if (!reason.trim()) { toast.error(r.describeError); return }
        setSubmitting(true)
        const res = await fetch(`/api/user/refund/${orderId}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }),
        })
        const data = await res.json()
        if (res.ok) {
            toast.success(r.requestSent)
            setRefund(data)
            setMessages([])
        } else {
            toast.error(data.error || r.sendError)
        }
        setSubmitting(false)
    }

    async function sendMessage() {
        if (!msgInput.trim() || !refund) return
        setSendingMsg(true)
        const res = await fetch(`/api/user/refund/${orderId}/messages`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: msgInput }),
        })
        if (res.ok) {
            const msg = await res.json()
            setMessages(p => [...p, msg])
            setMsgInput('')
        } else toast.error(r.messageError)
        setSendingMsg(false)
    }

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
        </div>
    )

    return (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 16px 80px' }}>
            <Link href="/minha-conta" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.88rem', marginBottom: 24 }}>
                <ArrowLeft size={15} /> {r.backToAccount}
            </Link>

            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>{r.title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 28 }}>{r.orderNumber} #{orderId.slice(-8).toUpperCase()}</p>

            {!refund && !canRequest && (
                <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <XCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
                    <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>{r.unavailable}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
                        {r.unavailableDesc}
                    </p>
                    <Link href="/minha-conta" className="btn btn-primary">{r.viewOrders}</Link>
                </div>
            )}

            {!refund && canRequest && (
                <div className="card">
                    <h2 style={{ fontWeight: 700, marginBottom: 8 }}>{r.describeReason}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 20, lineHeight: 1.6 }}>
                        {r.explainReason}
                    </p>
                    <textarea
                        className="input"
                        rows={5}
                        placeholder={r.placeholder}
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        style={{ resize: 'vertical', marginBottom: 16 }}
                    />
                    <button className="btn btn-primary" onClick={submitRefund} disabled={submitting || !reason.trim()}>
                        {submitting ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                        {submitting ? r.sending : r.sendRequest}
                    </button>
                </div>
            )}

            {refund && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Status */}
                    <div className="card" style={{ padding: '16px 20px' }}>
                        {(() => {
                            const info = STATUS_INFO[refund.status] || STATUS_INFO.PENDING
                            return (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ color: info.color }}>{info.icon}</span>
                                    <div>
                                        <p style={{ fontWeight: 700, color: info.color }}>{info.label}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                            {r.requestedOn} {new Date(refund.createdAt).toLocaleDateString(dateLocale, { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            )
                        })()}
                    </div>

                    {/* Reason */}
                    <div className="card">
                        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>{r.yourReason}</p>
                        <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text)' }}>{refund.reason}</p>
                    </div>

                    {/* Chat */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <p style={{ padding: '16px 20px 12px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>
                            {r.supportChat}
                        </p>
                        <div ref={chatRef} style={{ minHeight: 160, maxHeight: 320, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {messages.length === 0 && (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                                    {r.noMessages}
                                </p>
                            )}
                            {messages.map(msg => (
                                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.authorType === 'USER' ? 'flex-end' : 'flex-start' }}>
                                    <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: msg.authorType === 'USER' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: msg.authorType === 'USER' ? 'var(--primary)' : 'var(--bg-card2)', color: msg.authorType === 'USER' ? '#fff' : 'var(--text)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                                        {msg.content}
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>
                                        {msg.authorType === 'USER' ? r.you : r.support} · {new Date(msg.createdAt).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {refund.status !== 'APPROVED' && refund.status !== 'REJECTED' && (
                            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                                <input
                                    className="input"
                                    placeholder={r.writeMessage}
                                    value={msgInput}
                                    onChange={e => setMsgInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                                />
                                <button className="btn btn-primary" onClick={sendMessage} disabled={sendingMsg || !msgInput.trim()} style={{ flexShrink: 0, padding: '0 14px' }}>
                                    {sendingMsg ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
