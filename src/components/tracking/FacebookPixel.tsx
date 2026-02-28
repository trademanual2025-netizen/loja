'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

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
            window.fbq('track', 'PageView')
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
          fbq('track', 'PageView');
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

// Tracking functions (call from any client component)
export function fbTrackViewContent(product: { id: string; name: string; price: number }) {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'ViewContent', {
            content_ids: [product.id],
            content_name: product.name,
            content_type: 'product',
            value: product.price,
            currency: 'BRL',
        })
    }
}

export function fbTrackAddToCart(product: { id: string; name: string; price: number }) {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'AddToCart', {
            content_ids: [product.id],
            content_name: product.name,
            content_type: 'product',
            value: product.price,
            currency: 'BRL',
        })
    }
}

export function fbTrackInitiateCheckout(value: number, numItems: number) {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'InitiateCheckout', {
            value,
            currency: 'BRL',
            num_items: numItems,
        })
    }
}

export function fbTrackPurchase(orderId: string, value: number, productIds: string[]) {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'Purchase', {
            value,
            currency: 'BRL',
            content_ids: productIds,
            content_type: 'product',
            order_id: orderId,
        })
    }
}
