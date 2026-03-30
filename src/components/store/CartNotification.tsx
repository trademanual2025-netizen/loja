'use client'

import { useEffect, useState, useCallback } from 'react'
import { ShoppingBag, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/cart'
import { isExternalUrl } from '@/lib/image-utils'

interface CartNotificationItem {
    name: string
    image?: string
    price: number
}

let showNotification: (item: CartNotificationItem) => void = () => {}

export function triggerCartNotification(item: CartNotificationItem) {
    showNotification(item)
}

export function CartNotification() {
    const [visible, setVisible] = useState(false)
    const [item, setItem] = useState<CartNotificationItem | null>(null)
    const itemCount = useCart((s) => s.itemCount())
    const total = useCart((s) => s.total())

    const show = useCallback((newItem: CartNotificationItem) => {
        setItem(newItem)
        setVisible(true)
    }, [])

    useEffect(() => {
        showNotification = show
        return () => { showNotification = () => {} }
    }, [show])

    useEffect(() => {
        if (!visible) return
        const timer = setTimeout(() => setVisible(false), 5000)
        return () => clearTimeout(timer)
    }, [visible, item])

    if (!visible || !item) return null

    return (
        <div className="cart-notification">
            <div className="cart-notification-inner">
                <div className="cart-notification-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ShoppingBag size={16} />
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Adicionado ao carrinho</span>
                    </div>
                    <button onClick={() => setVisible(false)} className="cart-notification-close">
                        <X size={16} />
                    </button>
                </div>

                <div className="cart-notification-product">
                    {item.image && (
                        <div className="cart-notification-img">
                            <Image src={item.image} alt={item.name} fill sizes="48px" style={{ objectFit: 'cover' }} unoptimized={isExternalUrl(item.image)} />
                        </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                        <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>R$ {item.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                </div>

                <div className="cart-notification-summary">
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{itemCount} {itemCount === 1 ? 'item' : 'itens'} no carrinho</span>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>

                <div className="cart-notification-actions">
                    <Link href="/carrinho" onClick={() => setVisible(false)} className="cart-notification-btn-secondary">
                        Ver Carrinho
                    </Link>
                    <Link href="/checkout" onClick={() => setVisible(false)} className="cart-notification-btn-primary">
                        Finalizar Compra
                        <ArrowRight size={15} />
                    </Link>
                </div>
            </div>
        </div>
    )
}
