import { NextRequest, NextResponse } from 'next/server'

export default function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-pathname', pathname)

    const isAdminPage = pathname.startsWith('/admin') &&
        !pathname.startsWith('/admin/setup') &&
        !pathname.startsWith('/admin/login')

    const isAdminApi = pathname.startsWith('/api/admin') &&
        !pathname.startsWith('/api/admin/logout') &&
        !pathname.startsWith('/api/admin/login') &&
        !pathname.startsWith('/api/admin/setup')

    const hasAdminCookie = !!req.cookies.get('admin_token')?.value

    if (isAdminPage && !hasAdminCookie) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    if (isAdminApi && !hasAdminCookie) {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    if (pathname.startsWith('/checkout') || pathname.startsWith('/perfil')) {
        if (!req.cookies.get('auth_token')?.value) {
            return NextResponse.redirect(new URL(`/auth?redirect=${encodeURIComponent(pathname)}`, req.url))
        }
    }

    return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*', '/checkout/:path*', '/perfil/:path*'],
}
