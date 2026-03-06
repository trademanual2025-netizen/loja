import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || ''

export async function getAdminEmailFromCookie(): Promise<string | null> {
    if (!ADMIN_SECRET) return null
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('admin_token')?.value
        if (!token) return null
        const payload = verify(token, ADMIN_SECRET) as { email: string; role: string }
        if (payload.role !== 'admin') return null
        return payload.email
    } catch {
        return null
    }
}

export function getAdminEmailFromRequest(req: NextRequest): string | null {
    if (!ADMIN_SECRET) return null
    const token = req.cookies.get('admin_token')?.value
    if (!token) return null
    try {
        const payload = verify(token, ADMIN_SECRET) as { email: string; role: string }
        if (payload.role !== 'admin') return null
        return payload.email
    } catch {
        return null
    }
}

export function verifyAdminToken(req: NextRequest): boolean {
    return !!getAdminEmailFromRequest(req)
}

export function unauthorizedResponse() {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
}
