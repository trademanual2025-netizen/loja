'use client'

import '@/app/globals.css'
import Link from 'next/link'
import { AdminSidebar } from './AdminSidebar'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Inter, sans-serif' }}>
            {/* Mobile Header */}
            <header className="show-mobile" style={{
                position: 'fixed', top: 0, left: 0, right: 0, height: 60,
                background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', padding: '0 16px', zIndex: 50
            }}>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 8 }}>
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <span style={{ fontWeight: 800, marginLeft: 12 }}>Admin Panel</span>
            </header>

            <AdminSidebar isOpen={isSidebarOpen} />

            {/* Overlay */}
            {isSidebarOpen && (
                <div onClick={() => setIsSidebarOpen(false)}
                    className="show-mobile"
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }} />
            )}

            {/* Main */}
            <main style={{ flex: 1, padding: '32px', minHeight: '100vh', color: 'var(--text)', transition: 'margin 0.3s' }}
                className="admin-main">
                <style jsx>{`
                    .admin-main { margin-left: 230px; }
                    @media (max-width: 768px) {
                        .admin-main { margin-left: 0; padding-top: 80px !important; }
                    }
                `}</style>
                {children}
            </main>
        </div>
    )
}
