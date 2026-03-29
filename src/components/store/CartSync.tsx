'use client'

import { useEffect, useRef } from 'react'
import { useCart } from '@/lib/cart'

export function CartSync() {
    const { items, setItems } = useCart()
    const prevRef = useRef<string>('')
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const skipNextUpload = useRef(false)
    const hasLoadedFromServer = useRef(false)

    useEffect(() => {
        if (hasLoadedFromServer.current) return

        const localItems = [...items]
        let cancelled = false

        fetch('/api/user/sync-cart')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (cancelled) return
                hasLoadedFromServer.current = true
                if (!data) return

                if (Array.isArray(data.items) && data.items.length > 0) {
                    const serverKeys = new Set(data.items.map((i: any) => `${i.id}::${i.variantId ?? ''}`))
                    const localOnly = localItems.filter(i => !serverKeys.has(`${i.id}::${i.variantId ?? ''}`))
                    const merged = [
                        ...data.items.map((item: any) => ({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity || 1,
                            image: item.image || '',
                            slug: item.slug || item.id,
                            variantId: item.variantId || undefined,
                            variantName: item.variantName || undefined,
                        })),
                        ...localOnly,
                    ]
                    skipNextUpload.current = localOnly.length === 0
                    setItems(merged)
                }
            })
            .catch(() => { hasLoadedFromServer.current = true })

        return () => { cancelled = true }
    }, [])

    useEffect(() => {
        if (skipNextUpload.current) {
            skipNextUpload.current = false
            prevRef.current = JSON.stringify(items.map(i => ({
                id: i.id, name: i.name, price: i.price, quantity: i.quantity,
                image: i.image, slug: i.slug, variantId: i.variantId, variantName: i.variantName,
            })))
            return
        }

        const serialized = JSON.stringify(items.map(i => ({
            id: i.id, name: i.name, price: i.price, quantity: i.quantity,
            image: i.image, slug: i.slug, variantId: i.variantId, variantName: i.variantName,
        })))

        if (serialized === prevRef.current) return
        prevRef.current = serialized

        if (!hasLoadedFromServer.current) return

        if (timerRef.current) clearTimeout(timerRef.current)

        timerRef.current = setTimeout(() => {
            fetch('/api/user/sync-cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items }),
            }).catch(() => {})
        }, 1000)
    }, [items])

    return null
}
