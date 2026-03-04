'use client'

import '@/app/globals.css'
import { usePathname } from 'next/navigation'
import { AdminSidebar } from './AdminSidebar'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { ThemeProvider } from '@/components/ThemeProvider'

function AdminTopBar({ onMenuToggle, isOpen }: { onMenuToggle: () => void; isOpen: boolean }) {
    const pathname = usePathname()

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

    return (
        <header style={{
            position: 'fixed', top: 0, left: 0, right: 0, height: 58,
            background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', padding: '0 20px 0 16px',
            zIndex: 50, gap: 12,
        }}>
            <style>{`
                @media (min-width: 769px) {
                    .admin-topbar-title { margin-left: 240px; }
                }
            `}</style>

            {/* Mobile menu toggle */}
            <button onClick={onMenuToggle} className="show-mobile"
                style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: '6px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Page title — shifts right of sidebar on desktop */}
            <div className="admin-topbar-title" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{title}</span>
            </div>

            {/* Right side actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 800, color: 'white',
                }}>A</div>
            </div>
        </header>
    )
}

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

                <main style={{ flex: 1, padding: '32px', paddingTop: '90px', minHeight: '100vh', color: 'var(--text)' }}
                    className="admin-main">
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
