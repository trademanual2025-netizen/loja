const store = new Map<string, { count: number; resetAt: number }>()

export function getIP(req: Request): string {
    const fwd = (req as any).headers?.get?.('x-forwarded-for')
    const real = (req as any).headers?.get?.('x-real-ip')
    return fwd?.split(',')[0].trim() || real || 'unknown'
}

export function rateLimit(
    key: string,
    maxRequests: number,
    windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
    const now = Date.now()
    const entry = store.get(key)

    if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs })
        return { allowed: true, retryAfterSeconds: 0 }
    }

    if (entry.count >= maxRequests) {
        return {
            allowed: false,
            retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
        }
    }

    entry.count++
    return { allowed: true, retryAfterSeconds: 0 }
}
