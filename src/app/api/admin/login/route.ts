import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sign } from 'jsonwebtoken'

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'admin-secret-change-in-production'

export async function POST(req: NextRequest) {
    const { email, password } = await req.json()

    const admin = await prisma.adminUser.findUnique({ where: { email } })
    if (!admin) return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 })

    const hashedInput = crypto.createHash('sha256').update(password).digest('hex')
    if (hashedInput !== admin.password) return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 })

    const token = sign({ email: admin.email, role: 'admin' }, ADMIN_SECRET, { expiresIn: '30d' })
    const res = NextResponse.json({ ok: true })
    res.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
    })
    return res
}
