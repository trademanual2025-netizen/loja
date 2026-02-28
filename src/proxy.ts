import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'loja-secret-change-in-production'
const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'admin-secret-change-in-production'

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Proteger rotas admin (exceto setup e login)
    if (pathname.startsWith('/admin') &&
        !pathname.startsWith('/admin/setup') &&
        !pathname.startsWith('/admin/login')) {
        const token = req.cookies.get('admin_token')?.value
        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', req.url))
        }
        try {
            verify(token, ADMIN_SECRET)
        } catch {
            return NextResponse.redirect(new URL('/admin/login', req.url))
        }
    }

    // Proteger checkout e perfil (requer auth de usuário)
    if (pathname.startsWith('/checkout') || pathname.startsWith('/perfil')) {
        const token = req.cookies.get('auth_token')?.value
        if (!token) {
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
    matcher: ['/admin/:path*', '/checkout/:path*', '/perfil/:path*'],
}
