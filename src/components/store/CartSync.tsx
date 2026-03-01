'use client'

import { useEffect, useRef } from 'react'
import { useCart } from '@/lib/cart'

export function CartSync() {
    const { items } = useCart()
    const prevRef = useRef<string>('')
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
