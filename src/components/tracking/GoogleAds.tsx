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

export interface GtagUserData {
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
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
          gtag('config', '${adsId}', { 'allow_enhanced_conversions': true });
        `}
            </Script>
        </>
    )
}

function setEnhancedConversionData(userData?: GtagUserData) {
    if (!userData || typeof window === 'undefined' || typeof window.gtag !== 'function') return
    const data: Record<string, unknown> = {}
    if (userData.email) data.email = userData.email.toLowerCase().trim()
    if (userData.phone) {
        let phone = userData.phone.replace(/\D/g, '')
        if (phone.length === 11 && !phone.startsWith('55')) phone = `55${phone}`
        if (!phone.startsWith('+')) phone = `+${phone}`
        data.phone_number = phone
    }
    if (userData.firstName || userData.lastName || userData.street || userData.city || userData.state || userData.zipCode || userData.country) {
        const address: Record<string, string> = {}
        if (userData.firstName) address.first_name = userData.firstName
        if (userData.lastName) address.last_name = userData.lastName
        if (userData.street) address.street = userData.street
        if (userData.city) address.city = userData.city
        if (userData.state) address.region = userData.state
        if (userData.zipCode) address.postal_code = userData.zipCode.replace(/\D/g, '')
        if (userData.country) address.country = userData.country
        data.address = address
    }
    if (Object.keys(data).length > 0) {
        window.gtag('set', 'user_data', data)
    }
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

export function gtagBeginCheckout(
    value: number,
    items: Array<{ id: string; name: string; price: number; quantity: number }>,
    userData?: GtagUserData,
) {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        setEnhancedConversionData(userData)
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
    items: Array<{ id: string; name: string; price: number; quantity: number }>,
    userData?: GtagUserData,
) {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        setEnhancedConversionData(userData)
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
