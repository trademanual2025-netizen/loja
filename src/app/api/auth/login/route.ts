import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sign } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'loja-secret-change-in-production'

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json()

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 })
        }

        const hashedInput = crypto.createHash('sha256').update(password).digest('hex')
        if (hashedInput !== user.password) {
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
