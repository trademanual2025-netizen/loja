'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { User, ShoppingBag, KeyRound, Camera, MapPin, Phone, Mail, LogOut, Truck, ExternalLink, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { getCookie } from 'cookies-next'
import { dictionaries, Locale, defaultLocale, translateDb } from '@/lib/i18n'
import { useCart } from '@/lib/cart'

function getStatusLabels(dict: typeof dictionaries[typeof defaultLocale]): Record<string, { label: string; color: string }> {
    return {
        PENDING: { label: dict.profile.statusPending, color: '#f59e0b' },
        PAID: { label: dict.profile.statusPaid, color: '#22c55e' },
        CANCELLED: { label: dict.profile.statusCancelled, color: '#ef4444' },
        REFUNDED: { label: dict.profile.statusRefunded, color: '#8b5cf6' },
        DELIVERED: { label: dict.orderPage.statusDelivered, color: '#3b82f6' },
        REFUND_REQUESTED: { label: dict.orderPage.statusRefundRequested, color: '#ef4444' },
        SHIPPED: { label: dict.orderPage.statusShipped, color: '#06b6d4' },
    }
}

interface Order {
    id: string
    status: string
    total: number
    gateway: string
    gatewayData: string | null
    createdAt: string
    deliveredAt: string | null
    trackingCode: string | null
    trackingUrl: string | null
    shippingNote: string | null
    items: { id: string; quantity: number; price: number; product: { name: string; images: string[]; slug: string } }[]
}

interface Profile {
    id: string; name: string; email: string; phone: string | null
    avatarUrl: string | null; zipCode: string | null; street: string | null
    number: string | null; complement: string | null; neighborhood: string | null
    city: string | null; state: string | null; orders: Order[]
}

type Tab = 'perfil' | 'pedidos' | 'senha'

export default function MinhaContaPage() {
    const [dict, setDict] = useState(dictionaries[defaultLocale])
    const [locale, setLocale] = useState<Locale>(defaultLocale)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<Tab>('perfil')
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ name: '', phone: '', zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' })
    const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    async function loadProfile() {
        const r = await fetch('/api/user/profile')
        if (r.status === 401) { router.replace('/auth?redirect=/minha-conta'); return }
        const d = await r.json()
        setProfile(d)
        setForm({
            name: d.name || '', phone: d.phone || '', zipCode: d.zipCode || '',
            street: d.street || '', number: d.number || '', complement: d.complement || '',
            neighborhood: d.neighborhood || '', city: d.city || '', state: d.state || '',
        })
        setLoading(false)
    }

    useEffect(() => {
        loadProfile()
        const localeCookie = getCookie('NEXT_LOCALE') as Locale
        if (localeCookie && dictionaries[localeCookie]) {
            setDict(dictionaries[localeCookie])
            setLocale(localeCookie)
        }
    }, [])

    async function handleSaveProfile(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        const r = await fetch('/api/user/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        setSaving(false)
        if (r.ok) { toast.success(dict.profile.updated); loadProfile() }
        else { const d = await r.json(); toast.error(d.error) }
    }

    async function handleSavePwd(e: React.FormEvent) {
        e.preventDefault()
        if (pwdForm.newPassword !== pwdForm.confirm) { toast.error(dict.profile.passwordMismatch); return }
        setSaving(true)
        const r = await fetch('/api/user/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword }),
        })
        setSaving(false)
        if (r.ok) { toast.success(dict.profile.passwordChanged); setPwdForm({ currentPassword: '', newPassword: '', confirm: '' }) }
        else { const d = await r.json(); toast.error(d.error) }
    }

    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadingAvatar(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'avatars')
        const r = await fetch('/api/admin/upload', { method: 'POST', body: formData })
        const d = await r.json()
        if (!r.ok) { toast.error(d.error); setUploadingAvatar(false); return }
        await fetch('/api/user/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatarUrl: d.url }),
        })
        setUploadingAvatar(false)
        toast.success(dict.profile.photoUpdated)
        loadProfile()
    }

    const clearCart = useCart((s) => s.clearCart)

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' })
        clearCart()
        router.push('/')
        router.refresh()
    }

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <span className="spinner" />
        </div>
    )
    if (!profile) return null

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'perfil', label: dict.profile.title, icon: <User size={16} /> },
        { id: 'pedidos', label: `${dict.profile.ordersTab} (${profile.orders.length})`, icon: <ShoppingBag size={16} /> },
        { id: 'senha', label: dict.profile.pwdTab, icon: <KeyRound size={16} /> },
    ]

    return (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 16px 80px' }}>
            {/* Header perfil */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24, padding: '24px 28px' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-card2)', border: '3px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {profile.avatarUrl
                            ? <img src={profile.avatarUrl} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <User size={32} color="var(--text-muted)" />}
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}
                        style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {uploadingAvatar ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <Camera size={14} color="white" />}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                </div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: 4 }}>{profile.name}</h1>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={13} /> {profile.email}</span>
                        {profile.phone && <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={13} /> {profile.phone}</span>}
                        {profile.city && <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={13} /> {profile.city}{profile.state ? `/${profile.state}` : ''}</span>}
                    </div>
                </div>
                <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                    <LogOut size={15} /> {dict.profile.logout}
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        style={{ padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer', color: tab === t.id ? 'var(--primary)' : 'var(--text-muted)', fontWeight: tab === t.id ? 700 : 500, fontSize: '0.9rem', borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1, display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.15s' }}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* Tab: Perfil */}
            {tab === 'perfil' && (
                <div className="card fade-in">
                    <h3 style={{ fontWeight: 700, marginBottom: 20 }}>{dict.profile.personalData}</h3>
                    <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">{dict.profile.name} *</label>
                                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{dict.profile.phone}</label>
                                <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 99999-9999" />
                            </div>
                        </div>
                        <hr className="divider" />
                        <h4 style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={15} /> {dict.profile.addressTitle}</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 80px', gap: 12 }}>
                            <div className="form-group">
                                <label className="form-label">{dict.profile.zipCode}</label>
                                <input className="input" value={form.zipCode} onChange={e => setForm(f => ({ ...f, zipCode: e.target.value }))} placeholder="00000-000" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{dict.profile.street}</label>
                                <input className="input" value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{dict.profile.number}</label>
                                <input className="input" value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            <div className="form-group">
                                <label className="form-label">{dict.profile.complement}</label>
                                <input className="input" value={form.complement} onChange={e => setForm(f => ({ ...f, complement: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{dict.profile.neighborhood}</label>
                                <input className="input" value={form.neighborhood} onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 8 }}>
                                <div className="form-group">
                                    <label className="form-label">{dict.profile.city}</label>
                                    <input className="input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{dict.profile.state}</label>
                                    <input className="input" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} maxLength={2} />
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 4 }} disabled={saving}>
                            {saving ? <span className="spinner" /> : dict.profile.saveBtn}
                        </button>
                    </form>
                </div>
            )}

            {/* Tab: Pedidos */}
            {tab === 'pedidos' && (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {profile.orders.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
                            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>{dict.profile.emptyOrders}</p>
                            <Link href="/loja" className="btn btn-primary">{dict.profile.exploreBtn}</Link>
                        </div>
                    ) : profile.orders.map(order => {
                        const statusLabels = getStatusLabels(dict)
                        const statusObj = statusLabels[order.status] || { label: order.status, color: 'var(--text-muted)' }
                        let orderGd: Record<string, any> = {}
                        try { if (order.gatewayData) orderGd = JSON.parse(order.gatewayData) } catch {}
                        const wasPmChange = orderGd.cancelledReason === 'user_changed_payment_method'

                        return (
                            <div key={order.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                    <div>
                                        <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{dict.profile.orderId} #{order.id.slice(-8).toUpperCase()}</p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(order.createdAt).toLocaleDateString(locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        {wasPmChange ? (
                                            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>{dict.profile.changedPayment}</span>
                                        ) : (
                                            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, background: `${statusObj.color}22`, color: statusObj.color }}>{statusObj.label}</span>
                                        )}
                                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>R$ {order.total.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {order.items.map(item => (
                                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-card2)', flexShrink: 0 }}>
                                                {item.product.images[0]
                                                    ? <img src={item.product.images[0]} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><ShoppingBag size={18} color="var(--text-muted)" /></div>}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{translateDb(item.product.name, locale)}</p>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{dict.profile.qtd}: {item.quantity} · R$ {item.price.toFixed(2).replace('.', ',')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {order.status === 'PENDING' && (() => {
                                        let gd: Record<string, any> = {}
                                        try { if (order.gatewayData) gd = JSON.parse(order.gatewayData) } catch {}
                                        const pm = gd.paymentMethod || ''
                                        const isPix = pm === 'pix'
                                        const isBoleto = pm === 'boleto'
                                        return (
                                            <div style={{ padding: '10px 14px', background: 'rgba(234,179,8,0.08)', borderRadius: 8, border: '1px solid rgba(234,179,8,0.2)', fontSize: '0.82rem', color: '#d97706' }}>
                                                {(isPix || isBoleto) && (
                                                    <>
                                                        <strong>{isPix ? dict.profile.awaitingPix : dict.profile.awaitingBoleto}</strong>
                                                        <span style={{ margin: '0 6px' }}>·</span>
                                                    </>
                                                )}
                                                <Link href={`/pedido/${order.id}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                                                    {(isPix || isBoleto) ? dict.profile.viewPaymentData : dict.profile.viewOrder} →
                                                </Link>
                                                <span style={{ margin: '0 6px' }}>·</span>
                                                <Link href={`/pedido/${order.id}`} style={{ color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none', fontSize: '0.8rem' }}>
                                                    {dict.profile.changePaymentMethod}
                                                </Link>
                                            </div>
                                        )
                                    })()}
                                    {(order.trackingCode || order.shippingNote) && (
                                        <div style={{ padding: '12px 14px', background: 'rgba(34,197,94,0.08)', borderRadius: 10, border: '1px solid rgba(34,197,94,0.2)' }}>
                                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#22c55e', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <Truck size={13} /> {dict.profile.shippingInfo}
                                            </p>
                                            {order.trackingCode && (
                                                <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                    <span style={{ color: 'var(--text-muted)' }}>{dict.profile.trackingCode}</span>
                                                    <strong style={{ fontFamily: 'monospace' }}>{order.trackingCode}</strong>
                                                    {order.trackingUrl && (
                                                        <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
                                                            style={{ color: 'var(--primary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
                                                            <ExternalLink size={12} /> {dict.profile.track}
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                            {order.shippingNote && (
                                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: order.trackingCode ? 4 : 0 }}>{order.shippingNote}</p>
                                            )}
                                        </div>
                                    )}
                                    {order.status === 'DELIVERED' && (() => {
                                        const diffDays = order.deliveredAt ? (Date.now() - new Date(order.deliveredAt).getTime()) / (1000 * 60 * 60 * 24) : 0
                                        const eligible = !order.deliveredAt || diffDays <= 7
                                        if (!eligible) return null
                                        return (
                                            <div style={{ padding: '10px 14px', background: 'rgba(59,130,246,0.08)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                                <p style={{ fontSize: '0.82rem', color: '#3b82f6' }}>
                                                    {dict.refund.productIssue}
                                                    {order.deliveredAt && <span style={{ marginLeft: 4, opacity: 0.8 }}>({Math.max(0, Math.ceil(7 - diffDays))}{dict.refund.daysRemaining})</span>}
                                                </p>
                                                <Link href={`/reembolso/${order.id}`} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 8, background: 'rgba(59,130,246,0.15)', color: '#3b82f6', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                    <RotateCcw size={13} /> {dict.refund.requestRefund}
                                                </Link>
                                            </div>
                                        )
                                    })()}
                                    {(order.status === 'REFUND_REQUESTED' || order.status === 'REFUNDED') && (
                                        <div style={{ padding: '10px 14px', background: order.status === 'REFUNDED' ? 'rgba(139,92,246,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: 8, border: `1px solid ${order.status === 'REFUNDED' ? 'rgba(139,92,246,0.25)' : 'rgba(239,68,68,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                            <p style={{ fontSize: '0.82rem', color: order.status === 'REFUNDED' ? '#8b5cf6' : '#ef4444', fontWeight: 600 }}>
                                                {order.status === 'REFUND_REQUESTED' ? dict.refund.inReview : dict.refund.completed}
                                            </p>
                                            <Link href={`/reembolso/${order.id}`} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 8, background: order.status === 'REFUNDED' ? 'rgba(139,92,246,0.15)' : 'rgba(239,68,68,0.15)', color: order.status === 'REFUNDED' ? '#8b5cf6' : '#ef4444', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                <RotateCcw size={13} /> {dict.refund.viewRequest}
                                            </Link>
                                        </div>
                                    )}
                                    <div style={{ textAlign: 'right' }}>
                                        <Link href={`/pedido/${order.id}`} style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>{dict.profile.detailsBtn} →</Link>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Tab: Senha */}
            {tab === 'senha' && (
                <div className="card fade-in" style={{ maxWidth: 420 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 20 }}>{dict.profile.pwdTab}</h3>
                    <form onSubmit={handleSavePwd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="form-group">
                            <label className="form-label">{dict.profile.currentPwd} *</label>
                            <input className="input" type="password" required value={pwdForm.currentPassword} onChange={e => setPwdForm(f => ({ ...f, currentPassword: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{dict.profile.newPwd} *</label>
                            <input className="input" type="password" required minLength={6} value={pwdForm.newPassword} onChange={e => setPwdForm(f => ({ ...f, newPassword: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{dict.profile.confirmPwd} *</label>
                            <input className="input" type="password" required value={pwdForm.confirm} onChange={e => setPwdForm(f => ({ ...f, confirm: e.target.value }))} />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? <span className="spinner" /> : dict.profile.savePwdBtn}
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}
