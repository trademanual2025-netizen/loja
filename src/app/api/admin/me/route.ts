import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || ''

export async function GET(req: NextRequest) {
    if (!ADMIN_SECRET) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    const token = req.cookies.get('admin_token')?.value
    if (!token) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    try {
        const payload = verify(token, ADMIN_SECRET) as { email: string }
        const admin = await prisma.adminUser.findUnique({
            where: { email: payload.email },
            select: { id: true, name: true, email: true },
        })
        if (!admin) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 })
        return NextResponse.json(admin)
    } catch {
        return NextResponse.json({ error: 'Token inválido.' }, { status: 401 })
    }
}
