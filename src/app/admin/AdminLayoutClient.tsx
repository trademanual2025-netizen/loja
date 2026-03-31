'use client'

import { usePathname, useRouter } from 'next/navigation'
import { AdminSidebar } from './AdminSidebar'
import { AdminGuard } from './AdminGuard'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { ThemeProvider } from '@/components/ThemeProvider'
import Link from 'next/link'

interface AdminUser { id: string; name: string; email: string; avatarUrl?: string | null }

function AdminAvatar({ src, initials, size = 32, radius = 8, fontSize = '0.78rem' }: {
    src?: string | null; initials: string; size?: number; radius?: number; fontSize?: string
}) {
    if (src) {
        return <img src={src} alt="avatar" style={{ width: size, height: size, borderRadius: radius, objectFit: 'cover', flexShrink: 0, display: 'block' }} />
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

function AdminTopBar({ onMenuToggle, isOpen }: { onMenuToggle: () => void; isOpen: boolean }) {
    const pathname = usePathname()
    const router = useRouter()
    const [admin, setAdmin] = useState<AdminUser | null>(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
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
        '/admin/tracking': 'Tracking',
        '/admin/webhooks': 'Webhooks',
        '/admin/frete': 'Frete',
        '/admin/embed': 'Embed / iFrame',
        '/admin/perfil': 'Meu Perfil',
    }
    const title = PAGE_TITLES[pathname] || 'Admin'

    useEffect(() => {
        fetch('/api/admin/me').then(r => r.ok ? r.json() : null).then(d => { if (d) setAdmin(d) }).catch(() => {})
    }, [])

    useEffect(() => {
        function onOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
        }
        document.addEventListener('mousedown', onOutside)
        return () => document.removeEventListener('mousedown', onOutside)
    }, [])

    async function handleLogout() {
        await fetch('/api/admin/logout', { method: 'POST' })
        router.push('/admin/login')
        router.refresh()
    }

    const initials = admin?.name ? admin.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : 'A'

    const menuLink = (href: string, icon: React.ReactNode, label: string, newTab = false) => (
        <Link href={href} target={newTab ? '_blank' : undefined} onClick={() => setDropdownOpen(false)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
            borderRadius: 8, color: 'var(--text-muted)', textDecoration: 'none',
            fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.12s',
        }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}>
            {icon} {label}
        </Link>
    )

    return (
        <header style={{
            position: 'fixed', top: 0, left: 0, right: 0, height: 58,
            background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', padding: '0 20px 0 16px',
            zIndex: 50, gap: 12,
        }}>
            <style>{`
                @media (min-width: 769px) { .admin-topbar-title { margin-left: 240px; } }
                .admin-dropdown-anim { animation: fadeInDown 0.15s ease; }
                @keyframes fadeInDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
                .hide-mobile { display: flex; }
                @media (max-width: 768px) { .hide-mobile { display: none !important; } }
            `}</style>

            <button onClick={onMenuToggle} className="show-mobile"
                style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="admin-topbar-title" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{title}</span>
            </div>

            <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button onClick={() => setDropdownOpen(o => !o)} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: dropdownOpen ? 'var(--bg-card2)' : 'transparent',
                    border: '1px solid', borderColor: dropdownOpen ? 'var(--border)' : 'transparent',
                    borderRadius: 10, padding: '5px 10px 5px 5px',
                    cursor: 'pointer', transition: 'all 0.15s',
                }}>
                    <AdminAvatar src={admin?.avatarUrl} initials={initials} size={32} radius={8} />
                    <div className="hide-mobile" style={{ textAlign: 'left', flexDirection: 'column', gap: 0 }}>
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

                {dropdownOpen && (
                    <div className="admin-dropdown-anim" style={{
                        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                        minWidth: 220, background: 'var(--bg-card)',
                        border: '1px solid var(--border)', borderRadius: 12,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden', zIndex: 200,
                    }}>
                        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <AdminAvatar src={admin?.avatarUrl} initials={initials} size={40} radius={10} fontSize="0.88rem" />
                            <div style={{ minWidth: 0 }}>
                                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                                    {admin?.name || 'Admin'}
                                </p>
                                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '1px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {admin?.email || ''}
                                </p>
                            </div>
                        </div>

                        <div style={{ padding: '6px' }}>
                            {menuLink('/admin/perfil', <User size={15} />, 'Meu Perfil')}
                            {menuLink('/admin/settings', <Settings size={15} />, 'Configurações')}
                            {menuLink('/loja', <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>, 'Ver Loja', true)}
                            <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
                            <button onClick={handleLogout} style={{
                                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                                borderRadius: 8, color: 'var(--error)', background: 'none', border: 'none',
                                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, width: '100%', transition: 'all 0.12s',
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
    )
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <ThemeProvider storageKey="admin-theme" applyTo="wrapper">
            <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Inter, sans-serif' }}>
                <AdminTopBar onMenuToggle={() => setIsSidebarOpen(o => !o)} isOpen={isSidebarOpen} />
                <AdminSidebar isOpen={isSidebarOpen} />

                {isSidebarOpen && (
                    <div onClick={() => setIsSidebarOpen(false)} className="show-mobile"
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }} />
                )}

                <main className="admin-main" style={{ flex: 1, padding: '32px', paddingTop: '90px', minHeight: '100vh', color: 'var(--text)' }}>
                    <style>{`
                        .admin-main { margin-left: 240px; }
                        @media (max-width: 768px) { .admin-main { margin-left: 0 !important; padding-left: 16px !important; padding-right: 16px !important; } }
                    `}</style>
                    <AdminGuard>{children}</AdminGuard>
                </main>
            </div>
        </ThemeProvider>
    )
}
