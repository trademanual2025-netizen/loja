'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, Code2, Shield, Tag, LogOut, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Produtos', icon: Package },
    { href: '/admin/categories', label: 'Categorias', icon: Tag },
    { href: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
    { href: '/admin/leads', label: 'Leads', icon: Users },
    { href: '/admin/admins', label: 'Administradores', icon: Shield },
    { href: '/admin/settings', label: 'Configurações', icon: Settings },
    { href: '/admin/embed', label: 'Embed / iFrame', icon: Code2 },
]

interface Props {
    isOpen: boolean
}

export function AdminSidebar({ isOpen }: Props) {
    const pathname = usePathname()
    const router = useRouter()
    const { theme, setTheme } = useTheme()

    async function handleLogout() {
        await fetch('/api/admin/logout', { method: 'POST' })
        router.push('/admin/login')
        router.refresh()
    }

    return (
        <aside style={{
            width: 230,
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
        }} className="admin-sidebar">
            <style jsx>{`
                @media (min-width: 769px) {
                    .admin-sidebar {
                        transform: none !important;
                    }
                }
            `}</style>
            <div style={{ padding: '24px 20px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LayoutDashboard size={18} color="white" />
                    </div>
                    <div>
                        <p style={{ fontWeight: 800, fontSize: '0.95rem' }}>Admin</p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Painel de Controle</p>
                    </div>
                </div>
            </div>

            <nav style={{ flex: 1, padding: '0 10px' }}>
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href))
                    return (
                        <Link key={href} href={href}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, color: isActive ? 'var(--text)' : 'var(--text-muted)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: isActive ? 700 : 500, marginBottom: 2, background: isActive ? 'var(--bg-card2)' : 'transparent', transition: 'all 0.15s' }}>
                            <Icon size={18} color={isActive ? 'var(--primary)' : undefined} />
                            {label}
                        </Link>
                    )
                })}
            </nav>

            <div style={{ padding: '12px 10px 20px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px', marginBottom: 8, background: 'var(--bg)', borderRadius: 8 }}>
                    <button
                        type="button"
                        onClick={() => setTheme('light')}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '7px 0', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600,
                            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                            background: theme === 'light' ? 'var(--bg-card2)' : 'transparent',
                            color: theme === 'light' ? 'var(--text)' : 'var(--text-muted)',
                            boxShadow: theme === 'light' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        }}
                    >
                        <Sun size={14} /> Claro
                    </button>
                    <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '7px 0', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600,
                            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                            background: theme === 'dark' ? 'var(--bg-card2)' : 'transparent',
                            color: theme === 'dark' ? 'var(--text)' : 'var(--text-muted)',
                            boxShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                        }}
                    >
                        <Moon size={14} /> Escuro
                    </button>
                </div>
                <Link href="/loja" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.88rem', marginBottom: 4 }}>
                    <Package size={18} /> Ver Loja
                </Link>
                <button onClick={handleLogout} type="button" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.88rem', width: '100%' }}>
                    <LogOut size={18} /> Sair
                </button>
            </div>
        </aside>
    )
}
