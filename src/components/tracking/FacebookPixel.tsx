'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { generateEventId, sendCapiEvent, getMetaCookies, getFbclidFromUrl, type TrackingUserData } from '@/lib/tracking'

declare global {
    interface Window {
        fbq: (...args: unknown[]) => void
        _fbq: unknown
    }
}

export function FacebookPixel({ pixelId }: { pixelId: string }) {
    const pathname = usePathname()

    useEffect(() => {
        if (typeof window.fbq === 'function') {
            const eid = generateEventId()
            window.fbq('track', 'PageView', {}, { eventID: eid })
            sendCapiEvent({ event_name: 'PageView', event_id: eid })
        }
    }, [pathname])

    return (
        <>
            <Script id="facebook-pixel" strategy="afterInteractive">
                {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
        `}
            </Script>
            <noscript>
                <img
                    alt=""
                    height="1"
                    width="1"
                    style={{ display: 'none' }}
                    src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
                />
            </noscript>
        </>
    )
}

export function fbTrackViewContent(
    product: { id: string; name: string; price: number },
    userData?: TrackingUserData,
) {
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return
    const eid = generateEventId()
    window.fbq('track', 'ViewContent', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: product.price,
        currency: 'BRL',
    }, { eventID: eid })
    sendCapiEvent({
        event_name: 'ViewContent',
        event_id: eid,
        value: product.price,
        currency: 'BRL',
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        user_data: userData,
    })
}

export function fbTrackAddToCart(
    product: { id: string; name: string; price: number },
    userData?: TrackingUserData,
) {
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return
    const eid = generateEventId()
    window.fbq('track', 'AddToCart', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: product.price,
        currency: 'BRL',
    }, { eventID: eid })
    sendCapiEvent({
        event_name: 'AddToCart',
        event_id: eid,
        value: product.price,
        currency: 'BRL',
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        user_data: userData,
    })
}

export function fbTrackInitiateCheckout(
    value: number,
    numItems: number,
    userData?: TrackingUserData,
) {
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return
    const eid = generateEventId()
    window.fbq('track', 'InitiateCheckout', {
        value,
        currency: 'BRL',
        num_items: numItems,
    }, { eventID: eid })
    sendCapiEvent({
        event_name: 'InitiateCheckout',
        event_id: eid,
        value,
        currency: 'BRL',
        num_items: numItems,
        user_data: userData,
    })
}

export function fbTrackPurchase(
    orderId: string,
    value: number,
    productIds: string[],
    userData?: TrackingUserData,
) {
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return
    const eid = generateEventId()
    window.fbq('track', 'Purchase', {
        value,
        currency: 'BRL',
        content_ids: productIds,
        content_type: 'product',
        order_id: orderId,
    }, { eventID: eid })
    sendCapiEvent({
        event_name: 'Purchase',
        event_id: eid,
        value,
        currency: 'BRL',
        content_ids: productIds,
        content_type: 'product',
        order_id: orderId,
        user_data: userData,
    })
}
