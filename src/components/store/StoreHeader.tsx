'use client'

import Link from 'next/link'
import { ShoppingCart, User } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageSelector } from '@/components/LanguageSelector'
import { Dictionary } from '@/lib/i18n'
import { useTheme } from '@/components/ThemeProvider'

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
    ]
    const itemCount = useCart((s) => s.itemCount())
    const clearCart = useCart((s) => s.clearCart)
    const router = useRouter()
    const pathname = usePathname()
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])

    const isActive = (href: string) => {
        if (href === '/loja') return pathname === '/loja' || pathname.startsWith('/produto/')
        return pathname === href || pathname.startsWith(href + '/')
    }

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' })
        clearCart()
        router.refresh()
    }

    return (
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
                        <img src={logoUrl} alt={storeName} style={{ height: 40, maxWidth: 160, objectFit: 'contain', filter: theme === 'light' ? 'brightness(0)' : 'none', transition: 'filter 0.3s' }} />
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
                        <Link href="/minha-conta" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text)', textDecoration: 'none', padding: '6px 8px', borderRadius: 8, background: 'var(--bg-card2)', border: '1px solid var(--border)', fontSize: '0.8rem', fontWeight: 600 }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
                                {user.avatarUrl
                                    ? <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="hide-mobile">{user.name.split(' ')[0]}</span>
                        </Link>
                    ) : (
                        <Link href="/auth" className="btn btn-primary" style={{ padding: '6px 12px', background: 'var(--btn-header)', borderColor: 'var(--btn-header)', color: '#ffffff', fontSize: '0.8rem' }}>
                            <User size={16} /> <span className="hide-mobile">{dict.store.loginHeader || 'Entrar'}</span>
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
                </div>
            </div>
        </header>
    )
}
