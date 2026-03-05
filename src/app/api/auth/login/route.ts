import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { rateLimit, getIP } from '@/lib/rate-limit'

const JWT_SECRET = process.env.JWT_SECRET || ''

export async function POST(req: NextRequest) {
    try {
        const ip = getIP(req)
        const { allowed, retryAfterSeconds } = rateLimit(`user-login:${ip}`, 10, 15 * 60 * 1000)
        if (!allowed) {
            return NextResponse.json(
                { error: `Muitas tentativas. Tente novamente em ${retryAfterSeconds} segundos.` },
                { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
            )
        }

        if (!JWT_SECRET) {
            return NextResponse.json({ error: 'Configuração de segurança ausente.' }, { status: 500 })
        }

        const { email, password } = await req.json()

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 })
        }

        if (!user.active) {
            return NextResponse.json({ error: 'Conta desativada.' }, { status: 403 })
        }

        let passwordValid = false
        if (user.password.startsWith('$2')) {
            passwordValid = await bcrypt.compare(password, user.password)
        } else {
            const sha256Hash = crypto.createHash('sha256').update(password).digest('hex')
            passwordValid = sha256Hash === user.password
            if (passwordValid) {
                const bcryptHash = await bcrypt.hash(password, 10)
                await prisma.user.update({ where: { id: user.id }, data: { password: bcryptHash } })
            }
        }

        if (!passwordValid) {
            return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 })
        }

        const token = sign(
            { id: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        const response = NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
        })

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        })

        return response
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
    }
}
