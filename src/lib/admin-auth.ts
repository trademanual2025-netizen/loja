import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || ''

export function verifyAdminToken(req: NextRequest): boolean {
    if (!ADMIN_SECRET) return false
    const token = req.cookies.get('admin_token')?.value
    if (!token) return false
    try {
        verify(token, ADMIN_SECRET)
        return true
    } catch {
        return false
    }
}

export function unauthorizedResponse() {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
}
