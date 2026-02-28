import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || ''
const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || ''

export default function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl

    if (pathname.startsWith('/admin') &&
        !pathname.startsWith('/admin/setup') &&
        !pathname.startsWith('/admin/login') &&
        !pathname.startsWith('/api/admin/logout')) {
        const token = req.cookies.get('admin_token')?.value
        if (!token) {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
            }
            return NextResponse.redirect(new URL('/admin/login', req.url))
        }
        if (!ADMIN_SECRET) {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Configuração de segurança ausente.' }, { status: 500 })
            }
            return NextResponse.redirect(new URL('/admin/login', req.url))
        }
        try {
            verify(token, ADMIN_SECRET)
        } catch {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Token inválido.' }, { status: 401 })
            }
            return NextResponse.redirect(new URL('/admin/login', req.url))
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
