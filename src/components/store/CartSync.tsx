'use client'

import { useEffect, useRef } from 'react'
import { useCart } from '@/lib/cart'

export function CartSync() {
    const { items, setItems } = useCart()
    const prevRef = useRef<string>('')
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const restoredRef = useRef(false)

    useEffect(() => {
        if (restoredRef.current) return
        restoredRef.current = true

        if (items.length > 0) return

        fetch('/api/user/sync-cart')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data.items) && data.items.length > 0) {
                    setItems(data.items.map((item: any) => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity || 1,
                        image: item.image || '',
                        slug: item.slug || item.id,
                        variantId: item.variantId || undefined,
                        variantName: item.variantName || undefined,
                    })))
                }
            })
            .catch(() => {})
    }, [])

    useEffect(() => {
        const serialized = JSON.stringify(items.map(i => ({
            id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
            variantName: i.variantName,
        })))

        if (serialized === prevRef.current) return
        prevRef.current = serialized

        if (timerRef.current) clearTimeout(timerRef.current)

        timerRef.current = setTimeout(() => {
            fetch('/api/user/sync-cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items }),
            }).catch(() => {})
        }, 2000)
    }, [items])

    return null
}
