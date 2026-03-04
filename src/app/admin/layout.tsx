'use client'

import '@/app/globals.css'
import { usePathname, useRouter } from 'next/navigation'
import { AdminSidebar } from './AdminSidebar'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Menu, X, LogOut, User, Settings, ChevronDown, Camera, Upload } from 'lucide-react'
import { ThemeProvider } from '@/components/ThemeProvider'
import Link from 'next/link'

interface AdminUser { id: string; name: string; email: string; avatarUrl?: string | null }

/* ─── Avatar Component ─── */
function AdminAvatar({ src, initials, size = 32, radius = 8, fontSize = '0.78rem' }: {
    src?: string | null; initials: string; size?: number; radius?: number; fontSize?: string
}) {
    if (src) {
        return (
            <img src={src} alt="avatar" style={{
                width: size, height: size, borderRadius: radius,
                objectFit: 'cover', flexShrink: 0, display: 'block',
            }} />
        )
    }
    return (
        <div style={{
            width: size, height: size, borderRadius: radius, flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize, fontWeight: 800, color: 'white', letterSpacing: '0.02em',
        }}>
            {initials}
        </div>
    )
}

/* ─── Photo Upload Modal ─── */
function AvatarModal({ admin, onClose, onSaved }: {
    admin: AdminUser; onClose: () => void; onSaved: (a: AdminUser) => void
}) {
    const [preview, setPreview] = useState<string | null>(admin.avatarUrl || null)
    const [loading, setLoading] = useState(false)
    const [removing, setRemoving] = useState(false)
    const [error, setError] = useState('')
    const fileRef = useRef<HTMLInputElement>(null)

    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) { setError('Imagem muito grande. Máximo 5MB.'); return }
        setError('')
        setLoading(true)
        try {
            const fd = new FormData()
            fd.append('file', file)
            const r = await fetch('/api/admin/upload', { method: 'POST', body: fd })
            const d = await r.json()
            if (!r.ok) { setError(d.error || 'Erro ao enviar.'); setLoading(false); return }
            setPreview(d.url)
        } catch { setError('Erro ao enviar arquivo.') }
        setLoading(false)
    }

    async function handleSave() {
        setLoading(true); setError('')
        try {
            const r = await fetch('/api/admin/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatarUrl: preview }),
            })
            const d = await r.json()
            if (!r.ok) { setError(d.error || 'Erro ao salvar.'); setLoading(false); return }
            onSaved(d)
            onClose()
        } catch { setError('Erro ao salvar.') }
        setLoading(false)
    }

    async function handleRemove() {
        setRemoving(true); setError('')
        try {
            const r = await fetch('/api/admin/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatarUrl: null }),
            })
            const d = await r.json()
            if (!r.ok) { setError(d.error || 'Erro.'); setRemoving(false); return }
            onSaved(d)
            onClose()
        } catch { setError('Erro ao remover.') }
        setRemoving(false)
    }

    const initials = admin.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 16, width: '100%', maxWidth: 360, padding: 28,
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', margin: 0 }}>Foto de perfil</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Avatar preview */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <div style={{ position: 'relative' }}>
                        <AdminAvatar src={preview} initials={initials} size={96} radius={20} fontSize="1.5rem" />
                        <button
                            onClick={() => fileRef.current?.click()}
                            style={{
                                position: 'absolute', bottom: -6, right: -6,
                                width: 30, height: 30, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                border: '2px solid var(--bg-card)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: 'white',
                            }}>
                            <Camera size={13} />
                        </button>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)', margin: 0 }}>{admin.name}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{admin.email}</p>
                    </div>
                </div>

                {/* Upload area */}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
                <button onClick={() => fileRef.current?.click()} disabled={loading} style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '10px 0', borderRadius: 10, border: '1px dashed var(--border)',
                    background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                    fontSize: '0.85rem', fontWeight: 500, marginBottom: 10, transition: 'all 0.15s',
                }} onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                    <Upload size={15} /> {loading ? 'Enviando...' : 'Escolher imagem (JPG, PNG, WEBP)'}
                </button>

                {error && <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginBottom: 10, textAlign: 'center' }}>{error}</p>}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                    {(admin.avatarUrl || preview !== admin.avatarUrl) && preview && (
                        <button onClick={handleRemove} disabled={removing} style={{
                            flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid var(--border)',
                            background: 'transparent', color: 'var(--error)', cursor: 'pointer',
                            fontSize: '0.85rem', fontWeight: 600,
                        }}>
                            {removing ? 'Removendo...' : 'Remover foto'}
                        </button>
                    )}
                    <button onClick={handleSave} disabled={loading || preview === (admin.avatarUrl || null)} style={{
                        flex: 2, padding: '10px 0', borderRadius: 10, border: 'none',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        color: 'white', cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem', fontWeight: 700, opacity: loading ? 0.7 : 1,
                    }}>
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

/* ─── TopBar ─── */
function AdminTopBar({ onMenuToggle, isOpen }: { onMenuToggle: () => void; isOpen: boolean }) {
    const pathname = usePathname()
    const router = useRouter()
    const [admin, setAdmin] = useState<AdminUser | null>(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [avatarModalOpen, setAvatarModalOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const PAGE_TITLES: Record<string, string> = {
        '/admin': 'Dashboard',
        '/admin/products': 'Produtos',
        '/admin/categories': 'Categorias',
        '/admin/orders': 'Pedidos',
        '/admin/reembolsos': 'Reembolsos',
        '/admin/leads': 'Leads',
        '/admin/mensagens': 'Mensagens',
        '/admin/admins': 'Administradores',
        '/admin/settings': 'Configurações',
        '/admin/embed': 'Embed / iFrame',
    }
    const title = PAGE_TITLES[pathname] || 'Admin'

    useEffect(() => {
        fetch('/api/admin/me').then(r => r.ok ? r.json() : null).then(d => { if (d) setAdmin(d) }).catch(() => {})
    }, [])

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    async function handleLogout() {
        await fetch('/api/admin/logout', { method: 'POST' })
        router.push('/admin/login')
        router.refresh()
    }

    const handleAvatarSaved = useCallback((updated: AdminUser) => {
        setAdmin(updated)
    }, [])

    const initials = admin?.name
        ? admin.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : 'A'

    return (
        <>
            <header style={{
                position: 'fixed', top: 0, left: 0, right: 0, height: 58,
                background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', padding: '0 20px 0 16px',
                zIndex: 50, gap: 12,
            }}>
                <style>{`
                    @media (min-width: 769px) { .admin-topbar-title { margin-left: 240px; } }
                    .admin-profile-dropdown { animation: fadeInDown 0.15s ease; }
                    @keyframes fadeInDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
                    .hide-mobile { display: flex; }
                    @media (max-width: 768px) { .hide-mobile { display: none !important; } }
                `}</style>

                {/* Mobile menu toggle */}
                <button onClick={onMenuToggle} className="show-mobile"
                    style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: '6px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isOpen ? <X size={22} /> : <Menu size={22} />}
                </button>

                {/* Page title */}
                <div className="admin-topbar-title" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{title}</span>
                </div>

                {/* Profile dropdown trigger */}
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                    <button
                        onClick={() => setDropdownOpen(o => !o)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: dropdownOpen ? 'var(--bg-card2)' : 'transparent',
                            border: '1px solid', borderColor: dropdownOpen ? 'var(--border)' : 'transparent',
                            borderRadius: 10, padding: '5px 10px 5px 5px',
                            cursor: 'pointer', transition: 'all 0.15s',
                        }}>
                        <AdminAvatar src={admin?.avatarUrl} initials={initials} size={32} radius={8} />
                        <div className="hide-mobile" style={{ textAlign: 'left' }}>
                            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2, whiteSpace: 'nowrap', margin: 0 }}>
                                {admin?.name || 'Admin'}
                            </p>
                            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                                {admin?.email || ''}
                            </p>
                        </div>
                        <ChevronDown size={14} color="var(--text-muted)" className="hide-mobile"
                            style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }} />
                    </button>

                    {/* Dropdown */}
                    {dropdownOpen && (
                        <div className="admin-profile-dropdown" style={{
                            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                            minWidth: 220, background: 'var(--bg-card)',
                            border: '1px solid var(--border)', borderRadius: 12,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden',
                            zIndex: 200,
                        }}>
                            {/* Profile header — click to edit photo */}
                            <button
                                onClick={() => { setDropdownOpen(false); setAvatarModalOpen(true) }}
                                style={{
                                    width: '100%', padding: '14px 16px',
                                    borderBottom: '1px solid var(--border)',
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    background: 'transparent', border: 'none',
                                    borderBottom: '1px solid var(--border)',
                                    cursor: 'pointer', textAlign: 'left',
                                    transition: 'background 0.12s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card2)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                {/* Avatar with camera overlay on hover */}
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <AdminAvatar src={admin?.avatarUrl} initials={initials} size={40} radius={10} fontSize="0.88rem" />
                                    <div style={{
                                        position: 'absolute', inset: 0, borderRadius: 10,
                                        background: 'rgba(0,0,0,0.45)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        opacity: 0, transition: 'opacity 0.15s',
                                    }} className="avatar-overlay">
                                        <Camera size={14} color="white" />
                                    </div>
                                    <style>{`.admin-profile-dropdown button:hover .avatar-overlay { opacity: 1 !important; }`}</style>
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                                        {admin?.name || 'Admin'}
                                    </p>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '1px 0 0' }}>
                                        Editar foto de perfil
                                    </p>
                                </div>
                            </button>

                            {/* Menu items */}
                            <div style={{ padding: '6px' }}>
                                <Link href="/admin/admins" onClick={() => setDropdownOpen(false)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.12s' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)' }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}>
                                    <User size={15} /> Meu Perfil
                                </Link>
                                <Link href="/admin/settings" onClick={() => setDropdownOpen(false)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.12s' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)' }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}>
                                    <Settings size={15} /> Configurações
                                </Link>
                                <Link href="/loja" target="_blank" onClick={() => setDropdownOpen(false)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.12s' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)' }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                    Ver Loja
                                </Link>
                                <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
                                <button onClick={handleLogout} style={{
                                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                                    borderRadius: 8, color: 'var(--error)', background: 'none',
                                    border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                                    width: '100%', transition: 'all 0.12s',
                                }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)' }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                                    <LogOut size={15} /> Sair da conta
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Avatar edit modal */}
            {avatarModalOpen && admin && (
                <AvatarModal admin={admin} onClose={() => setAvatarModalOpen(false)} onSaved={handleAvatarSaved} />
            )}
        </>
    )
}

/* ─── Layout ─── */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const pathname = usePathname()

    const isLoginOrSetup = pathname === '/admin/login' || pathname === '/admin/setup'

    if (isLoginOrSetup) {
        return (
            <ThemeProvider storageKey="admin-theme" applyTo="wrapper">
                {children}
            </ThemeProvider>
        )
    }

    return (
        <ThemeProvider storageKey="admin-theme" applyTo="wrapper">
            <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Inter, sans-serif' }}>
                <AdminTopBar onMenuToggle={() => setIsSidebarOpen(o => !o)} isOpen={isSidebarOpen} />
                <AdminSidebar isOpen={isSidebarOpen} />

                {isSidebarOpen && (
                    <div onClick={() => setIsSidebarOpen(false)}
                        className="show-mobile"
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }} />
                )}

                <main className="admin-main" style={{ flex: 1, padding: '32px', paddingTop: '90px', minHeight: '100vh', color: 'var(--text)' }}>
                    <style>{`
                        .admin-main { margin-left: 240px; }
                        @media (max-width: 768px) { .admin-main { margin-left: 0 !important; padding-left: 16px !important; padding-right: 16px !important; } }
                    `}</style>
                    {children}
                </main>
            </div>
        </ThemeProvider>
    )
}
