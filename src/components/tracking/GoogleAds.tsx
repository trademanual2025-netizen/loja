'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

declare global {
    interface Window {
        gtag: (...args: unknown[]) => void
        dataLayer: unknown[]
    }
}

export function GoogleAds({ adsId }: { adsId: string }) {
    const pathname = usePathname()

    useEffect(() => {
        if (typeof window.gtag === 'function') {
            window.gtag('event', 'page_view')
        }
    }, [pathname])

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`}
                strategy="afterInteractive"
            />
            <Script id="google-ads" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${adsId}');
        `}
            </Script>
        </>
    )
}

export function gtagViewItem(product: { id: string; name: string; price: number }) {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'view_item', {
            currency: 'BRL',
            value: product.price,
            items: [{ item_id: product.id, item_name: product.name, price: product.price }],
        })
    }
}

export function gtagAddToCart(product: { id: string; name: string; price: number }) {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'add_to_cart', {
            currency: 'BRL',
            value: product.price,
            items: [{ item_id: product.id, item_name: product.name, price: product.price }],
        })
    }
}

export function gtagBeginCheckout(value: number, items: Array<{ id: string; name: string; price: number; quantity: number }>) {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'begin_checkout', {
            currency: 'BRL',
            value,
            items: items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity })),
        })
    }
}

export function gtagPurchase(
    orderId: string,
    value: number,
    label: string,
    adsId: string,
    items: Array<{ id: string; name: string; price: number; quantity: number }>
) {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'conversion', {
            send_to: `${adsId}/${label}`,
            value,
            currency: 'BRL',
            transaction_id: orderId,
        })
        window.gtag('event', 'purchase', {
            transaction_id: orderId,
            value,
            currency: 'BRL',
            items: items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity })),
        })
    }
}
