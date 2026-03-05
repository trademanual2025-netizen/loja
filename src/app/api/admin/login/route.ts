import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { rateLimit, getIP } from '@/lib/rate-limit'

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || ''

export async function POST(req: NextRequest) {
    try {
        const ip = getIP(req)
        const { allowed, retryAfterSeconds } = rateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000)
        if (!allowed) {
            return NextResponse.json(
                { error: `Muitas tentativas. Tente novamente em ${retryAfterSeconds} segundos.` },
                { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
            )
        }

        if (!ADMIN_SECRET) {
            return NextResponse.json({ error: 'Configuração de segurança ausente.' }, { status: 500 })
        }

        const { email, password } = await req.json()

        const admin = await prisma.adminUser.findUnique({ where: { email } })
        if (!admin) return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 })

        let passwordValid = false
        if (admin.password.startsWith('$2')) {
            passwordValid = await bcrypt.compare(password, admin.password)
        } else {
            const sha256Hash = crypto.createHash('sha256').update(password).digest('hex')
            passwordValid = sha256Hash === admin.password
            if (passwordValid) {
                const bcryptHash = await bcrypt.hash(password, 10)
                await prisma.adminUser.update({ where: { id: admin.id }, data: { password: bcryptHash } })
            }
        }

        if (!passwordValid) return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 })

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
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
    }
}
