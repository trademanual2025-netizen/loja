import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || ''
const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || ''

function verifyAdminCookie(req: NextRequest): { email: string } | null {
    const token = req.cookies.get('admin_token')?.value
    if (!token || !ADMIN_SECRET) return null
    try {
        return verify(token, ADMIN_SECRET) as { email: string }
    } catch {
        return null
    }
}

export default function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl

    const isAdminPage = pathname.startsWith('/admin') &&
        !pathname.startsWith('/admin/setup') &&
        !pathname.startsWith('/admin/login')

    const isAdminApi = pathname.startsWith('/api/admin') &&
        !pathname.startsWith('/api/admin/logout')

    if (isAdminPage || isAdminApi) {
        const payload = verifyAdminCookie(req)
        if (!payload) {
            if (isAdminApi) {
                return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
            }
            return NextResponse.redirect(new URL('/admin/login', req.url))
        }
        // Pass verified email to API routes via request header
        if (isAdminApi) {
            const requestHeaders = new Headers(req.headers)
            requestHeaders.set('x-admin-email', payload.email)
            return NextResponse.next({ request: { headers: requestHeaders } })
        }
    }

    if (pathname.startsWith('/checkout') || pathname.startsWith('/perfil')) {
        const token = req.cookies.get('auth_token')?.value
        if (!token) {
            return NextResponse.redirect(new URL(`/auth?redirect=${encodeURIComponent(pathname)}`, req.url))
        }
        if (!JWT_SECRET) {
            return NextResponse.redirect(new URL(`/auth?redirect=${encodeURIComponent(pathname)}`, req.url))
        }
        try {
            verify(token, JWT_SECRET)
        } catch {
            return NextResponse.redirect(new URL(`/auth?redirect=${encodeURIComponent(pathname)}`, req.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*', '/checkout/:path*', '/perfil/:path*'],
}
