'use client'

import Link from 'next/link'
import { ShoppingCart, User, X, Menu } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageSelector } from '@/components/LanguageSelector'
import { Dictionary } from '@/lib/i18n'

interface Props {
    storeName: string
    logoUrl?: string | null
    user?: { name: string; email: string; avatarUrl?: string | null } | null
    dict: Dictionary
}

export function StoreHeader({ storeName, logoUrl, user, dict }: Props) {
    const NAV_LINKS = [
        { label: dict.nav?.home || 'Início', href: '/' },
        { label: dict.nav?.store || 'Loja', href: '/loja' },
        { label: dict.nav?.ourBrand || 'Nossa Marca', href: '/nossamarca' },
        { label: dict.nav?.ringSize || 'Guia de Anel', href: '/ringsize' },
        { label: dict.nav?.contact || 'Contato', href: '/contato' },
    ]
    const itemCount = useCart((s) => s.itemCount())
    const clearCart = useCart((s) => s.clearCart)
    const router = useRouter()
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => { setMounted(true) }, [])
    useEffect(() => { setMenuOpen(false) }, [pathname])

    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [menuOpen])

    const isActive = (href: string) => {
        if (href === '/loja') return pathname === '/loja' || pathname.startsWith('/produto/')
        return pathname === href || pathname.startsWith(href + '/')
    }

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' })
        clearCart()
        router.refresh()
        setMenuOpen(false)
    }

    return (
        <>
            <header style={{
                background: 'var(--bg-header)',
                borderBottom: '1px solid var(--border)',
                position: 'sticky', top: 0, zIndex: 50,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
            }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
                    <Link href="/loja" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: 8 }}>
                        {logoUrl ? (
                            <img src={logoUrl} alt={storeName} className="store-logo-img" style={{ height: 40, maxWidth: 160, objectFit: 'contain' }} />
                        ) : (
                            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>{storeName}</span>
                        )}
                    </Link>

                    <nav className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                        {NAV_LINKS.map(({ label, href }) => {
                            const active = isActive(href)
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    style={{
                                        color: active ? 'var(--text)' : 'var(--text-muted)',
                                        textDecoration: 'none',
                                        fontSize: '0.88rem',
                                        fontWeight: active ? 600 : 500,
                                        transition: 'color 0.2s',
                                        paddingBottom: 4,
                                        borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
                                    }}
                                >
                                    {label}
                                </Link>
                            )
                        })}
                    </nav>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <LanguageSelector />
                            <ThemeToggle />
                        </div>

                        {user ? (
                            <Link href="/minha-conta" className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text)', textDecoration: 'none', padding: '6px 8px', borderRadius: 8, background: 'var(--bg-card2)', border: '1px solid var(--border)', fontSize: '0.8rem', fontWeight: 600 }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
                                    {user.avatarUrl
                                        ? <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : user.name.charAt(0).toUpperCase()}
                                </div>
                                {user.name.split(' ')[0]}
                            </Link>
                        ) : (
                            <Link href="/auth" className="btn btn-primary hide-mobile" style={{ padding: '6px 12px', background: 'var(--btn-header)', borderColor: 'var(--btn-header)', color: '#ffffff', fontSize: '0.8rem' }}>
                                <User size={16} /> {dict.store.loginHeader || 'Entrar'}
                            </Link>
                        )}

                        <Link href="/carrinho" className="btn btn-secondary" style={{ padding: '6px 12px', position: 'relative', color: 'var(--icon-cart)', borderColor: 'var(--border)', fontSize: '0.8rem' }}>
                            <ShoppingCart size={16} />
                            <span className="hide-mobile">{dict.store.cart}</span>
                            {mounted && itemCount > 0 && (
                                <span style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>
                                    {itemCount > 9 ? '9+' : itemCount}
                                </span>
                            )}
                        </Link>

                        <button
                            className="show-mobile"
                            onClick={() => setMenuOpen(o => !o)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            aria-label="Menu"
                        >
                            {menuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </header>

            {menuOpen && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 49,
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)',
                    }}
                    onClick={() => setMenuOpen(false)}
                />
            )}

            <div style={{
                position: 'fixed',
                top: 64, left: 0, right: 0,
                zIndex: 49,
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                transform: menuOpen ? 'translateY(0)' : 'translateY(-110%)',
                transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                padding: '16px 0 24px',
            }}>
                <nav style={{ display: 'flex', flexDirection: 'column' }}>
                    {NAV_LINKS.map(({ label, href }) => {
                        const active = isActive(href)
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setMenuOpen(false)}
                                style={{
                                    padding: '14px 24px',
                                    color: active ? 'var(--primary)' : 'var(--text)',
                                    textDecoration: 'none',
                                    fontSize: '1rem',
                                    fontWeight: active ? 700 : 500,
                                    borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
                                    background: active ? 'var(--bg-card2)' : 'transparent',
                                    transition: 'background 0.15s',
                                }}
                            >
                                {label}
                            </Link>
                        )
                    })}
                </nav>

                <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0 0', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {user ? (
                        <>
                            <Link href="/minha-conta" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
                                    {user.avatarUrl
                                        ? <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : user.name.charAt(0).toUpperCase()}
                                </div>
                                {user.name}
                            </Link>
                            <button onClick={handleLogout} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'left', width: '100%' }}>
                                {dict.profile?.logout || 'Sair'}
                            </button>
                        </>
                    ) : (
                        <Link href="/auth" onClick={() => setMenuOpen(false)} className="btn btn-primary" style={{ padding: '10px 20px', background: 'var(--btn-header)', borderColor: 'var(--btn-header)', color: '#fff', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <User size={16} /> {dict.store.loginHeader || 'Entrar'}
                        </Link>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <LanguageSelector />
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </>
    )
}
