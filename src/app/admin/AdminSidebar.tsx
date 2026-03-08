'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard, Package, ShoppingBag, Users, Settings,
    Code2, Shield, Tag, LogOut, Sun, Moon, Mail, RotateCcw, ChevronRight, UserCircle, MessageSquare
} from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { useEffect, useState } from 'react'

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Produtos', icon: Package },
    { href: '/admin/categories', label: 'Categorias', icon: Tag },
    { href: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
    { href: '/admin/reembolsos', label: 'Reembolsos', icon: RotateCcw },
    { href: '/admin/leads', label: 'Leads', icon: Users },
    { href: '/admin/comunicacao', label: 'Comunicação', icon: MessageSquare },
    { href: '/admin/mensagens', label: 'Mensagens', icon: Mail },
    { href: '/admin/admins', label: 'Administradores', icon: Shield },
    { href: '/admin/settings', label: 'Configurações', icon: Settings },
    { href: '/admin/embed', label: 'Embed / iFrame', icon: Code2 },
    { href: '/admin/perfil', label: 'Meu Perfil', icon: UserCircle },
]

interface Props { isOpen: boolean }

export function AdminSidebar({ isOpen }: Props) {
    const pathname = usePathname()
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const [logo, setLogo] = useState<string>('')
    const [storeName, setStoreName] = useState<string>('')

    useEffect(() => {
        fetch('/api/admin/settings')
            .then(r => r.json())
            .then(s => {
                setLogo(s.admin_logo || s.store_logo || '')
                setStoreName(s.store_name || '')
            })
            .catch(() => {})
    }, [])

    async function handleLogout() {
        await fetch('/api/admin/logout', { method: 'POST' })
        router.push('/admin/login')
        router.refresh()
    }

    return (
        <>
            <style>{`
                @media (min-width: 769px) { .admin-sidebar { transform: none !important; } }
                .nav-item { transition: all 0.15s ease; }
                .nav-item:hover { background: var(--bg-card2) !important; color: var(--text) !important; }
            `}</style>

            <aside className="admin-sidebar" style={{
                width: 240,
                background: 'var(--bg-card)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                top: 0,
                left: 0,
                zIndex: 100,
                transition: 'transform 0.3s ease',
                transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
                overflow: 'hidden',
            }}>
                {/* Top accent line */}
                <div style={{ height: 3, background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)', flexShrink: 0 }} />

                {/* Brand header */}
                <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                    {logo ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                background: theme === 'light' ? '#1a1a2e' : 'transparent',
                                padding: theme === 'light' ? '6px 12px' : 0,
                                borderRadius: 8,
                                display: 'inline-flex',
                                alignItems: 'center',
                            }}>
                                <img
                                    src={logo}
                                    alt={storeName || 'Logo'}
                                    style={{ height: 36, maxWidth: 140, objectFit: 'contain', borderRadius: 6 }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 10,
                                background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <LayoutDashboard size={16} color="white" />
                            </div>
                            <div>
                                <p style={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.2 }}>
                                    {storeName || 'Admin'}
                                </p>
                                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 1 }}>Painel de Controle</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 8px 4px' }}>Menu</p>
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href))
                        return (
                            <Link key={href} href={href} className="nav-item" style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '9px 10px', borderRadius: 8,
                                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                fontWeight: isActive ? 700 : 500,
                                marginBottom: 1,
                                background: isActive ? 'var(--bg-card2)' : 'transparent',
                                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                                position: 'relative',
                            }}>
                                <Icon size={16} color={isActive ? 'var(--primary)' : undefined} style={{ flexShrink: 0 }} />
                                <span style={{ flex: 1 }}>{label}</span>
                                {isActive && <ChevronRight size={12} color="var(--primary)" style={{ flexShrink: 0 }} />}
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom section */}
                <div style={{ padding: '10px 8px 14px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
                    {/* Theme toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px', marginBottom: 6, background: 'var(--bg)', borderRadius: 8 }}>
                        <button type="button" onClick={() => setTheme('light')} style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                            padding: '7px 0', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
                            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                            background: theme === 'light' ? 'var(--bg-card)' : 'transparent',
                            color: theme === 'light' ? 'var(--text)' : 'var(--text-muted)',
                            boxShadow: theme === 'light' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                        }}>
                            <Sun size={13} /> Claro
                        </button>
                        <button type="button" onClick={() => setTheme('dark')} style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                            padding: '7px 0', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
                            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                            background: theme === 'dark' ? 'var(--bg-card)' : 'transparent',
                            color: theme === 'dark' ? 'var(--text)' : 'var(--text-muted)',
                            boxShadow: theme === 'dark' ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
                        }}>
                            <Moon size={13} /> Escuro
                        </button>
                    </div>

                    <Link href="/loja" style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 10px', borderRadius: 8,
                        color: 'var(--text-muted)', textDecoration: 'none',
                        fontSize: '0.82rem', marginBottom: 2,
                        transition: 'all 0.15s',
                    }} className="nav-item">
                        <Package size={15} /> Ver Loja
                    </Link>
                    <button onClick={handleLogout} type="button" style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 10px', borderRadius: 8,
                        color: 'var(--error)', background: 'none', border: 'none',
                        cursor: 'pointer', fontSize: '0.82rem', width: '100%',
                        transition: 'all 0.15s',
                    }}>
                        <LogOut size={15} /> Sair
                    </button>
                </div>
            </aside>
        </>
    )
}
