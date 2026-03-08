'use client'

export function generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export function getMetaCookies(): { fbc: string | null; fbp: string | null } {
    if (typeof document === 'undefined') return { fbc: null, fbp: null }
    const cookies = document.cookie.split(';').reduce((acc, c) => {
        const [k, v] = c.trim().split('=')
        if (k) acc[k] = v || ''
        return acc
    }, {} as Record<string, string>)
    return {
        fbc: cookies['_fbc'] || null,
        fbp: cookies['_fbp'] || null,
    }
}

export function getFbclidFromUrl(): string | null {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    return params.get('fbclid')
}

export interface TrackingUserData {
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
    externalId?: string
}

export interface CapiEventPayload {
    event_name: string
    event_id: string
    value?: number
    currency?: string
    content_ids?: string[]
    content_name?: string
    content_type?: string
    num_items?: number
    order_id?: string
    user_data?: TrackingUserData
    fbc?: string | null
    fbp?: string | null
    event_source_url?: string
}

export function buildFbcFromFbclid(fbclid: string): string {
    return `fb.1.${Date.now()}.${fbclid}`
}

export function sendCapiEvent(payload: CapiEventPayload): void {
    const { fbc: cookieFbc, fbp } = getMetaCookies()
    let fbc = payload.fbc ?? cookieFbc
    if (!fbc) {
        const fbclid = getFbclidFromUrl()
        if (fbclid) fbc = buildFbcFromFbclid(fbclid)
    }
    const enriched = {
        ...payload,
        fbc,
        fbp: payload.fbp ?? fbp,
        event_source_url: payload.event_source_url ?? (typeof window !== 'undefined' ? window.location.href : undefined),
    }
    fetch('/api/tracking/capi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enriched),
    }).catch(() => {})
}
