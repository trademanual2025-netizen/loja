'use client'

import { useCart } from '@/lib/cart'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getCookie } from 'cookies-next'
import { useState, useEffect } from 'react'
import { dictionaries, Locale, defaultLocale, translateDb } from '@/lib/i18n'

export default function CarrinhoPage() {
    const { items, removeItem, updateQuantity, total } = useCart()
    const [dict, setDict] = useState(dictionaries[defaultLocale])
    const [locale, setLocale] = useState<Locale>(defaultLocale)

    useEffect(() => {
        const localeCookie = getCookie('NEXT_LOCALE') as Locale
        if (localeCookie && dictionaries[localeCookie]) {
            setDict(dictionaries[localeCookie])
            setLocale(localeCookie)
        }
    }, [])

    if (items.length === 0) {
        return (
            <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
                <div style={{ textAlign: 'center', maxWidth: 420 }}>
                    <div style={{
                        width: 120, height: 120, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 32px', opacity: 0.15,
                    }}>
                        <ShoppingBag size={56} color="white" />
                    </div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 12, color: 'var(--text-title)' }}>
                        {dict.cart.empty}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: 32 }}>
                        {locale === 'pt' ? 'Parece que você ainda não escolheu nada. Explore nossa coleção e encontre algo especial para você.' :
                         locale === 'en' ? 'Looks like you haven\'t picked anything yet. Explore our collection and find something special.' :
                         'Parece que aún no has elegido nada. Explora nuestra colección y encuentra algo especial.'}
                    </p>
                    <Link href="/loja" className="product-card-btn" style={{ display: 'inline-flex', padding: '14px 40px', fontSize: '1rem', borderRadius: 10, textDecoration: 'none' }}>
                        <ShoppingBag size={18} />
                        {locale === 'pt' ? 'Explorar Produtos' :
                         locale === 'en' ? 'Explore Products' :
                         'Explorar Productos'}
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 16px' }}>
            <h1 style={{ fontWeight: 800, fontSize: '1.8rem', marginBottom: 32 }}>{dict.cart.title}</h1>
            <div className="cart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
                {/* Itens */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {items.map((item) => (
                        <div key={`${item.id}-${item.variantId || 'base'}`} className="card cart-item" style={{ display: 'flex', gap: 16, padding: 16, alignItems: 'center' }}>
                            <div style={{ width: 80, height: 80, background: 'var(--bg-card2)', borderRadius: 8, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                                {item.image ? <Image src={item.image} alt={item.name} fill sizes="80px" style={{ objectFit: 'cover' }} /> : null}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 600, marginBottom: 4 }}>{translateDb(item.name, locale)}</p>
                                {item.variantName && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: -2, marginBottom: 4 }}>{item.variantName}</p>}
                                <p style={{ color: 'var(--primary)', fontWeight: 700 }}>R$ {item.price.toFixed(2).replace('.', ',')}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button onClick={() => updateQuantity(item.id, item.variantId, item.quantity - 1)} className="btn btn-secondary" style={{ padding: '4px 8px' }}><Minus size={14} /></button>
                                <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.variantId, item.quantity + 1)} className="btn btn-secondary" style={{ padding: '4px 8px' }}><Plus size={14} /></button>
                            </div>
                            <span style={{ fontWeight: 700, minWidth: 80, textAlign: 'right' }}>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                            <button onClick={() => removeItem(item.id, item.variantId)} className="btn btn-secondary" style={{ padding: '4px 8px', color: 'var(--error)' }}><Trash2 size={14} /></button>
                        </div>
                    ))}
                </div>

                {/* Resumo */}
                <div className="card" style={{ position: 'sticky', top: 80 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{dict.checkout.orderSummary || 'Resumo'}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--text-muted)' }}>
                        <span>{dict.cart.subtotal}</span>
                        <span>R$ {total().toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <span>{dict.checkout.shipping || 'Frete'}</span>
                        <span>{dict.cart.subtotal === 'Subtotal' ? 'Calculado no checkout' : 'Calculated at checkout'}</span>
                    </div>
                    <hr className="divider" />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem', marginBottom: 20 }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--primary)' }}>R$ {total().toFixed(2).replace('.', ',')}</span>
                    </div>
                    <Link href="/checkout" className="btn btn-primary btn-full" style={{ justifyContent: 'center' }}>
                        {dict.cart.checkoutBtn}
                    </Link>
                    <Link href="/loja" className="btn btn-secondary btn-full" style={{ marginTop: 8, justifyContent: 'center' }}>
                        {dict.cart.continueShopping}
                    </Link>
                </div>
            </div>
        </div>
    )
}
