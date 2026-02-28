import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// GET — lista todos os admins
export async function GET() {
    const admins = await prisma.adminUser.findMany({
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true, email: true, createdAt: true },
    })
    return NextResponse.json({ admins })
}

// POST — cria novo admin
export async function POST(req: NextRequest) {
    const { name, email, password } = await req.json()
    if (!name || !email || !password)
        return NextResponse.json({ error: 'Nome, e-mail e senha são obrigatórios.' }, { status: 400 })

    const existing = await prisma.adminUser.findUnique({ where: { email } })
    if (existing)
        return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 409 })

    const hashed = crypto.createHash('sha256').update(password).digest('hex')
    const admin = await prisma.adminUser.create({
        data: { name, email, password: hashed },
        select: { id: true, name: true, email: true, createdAt: true },
    })
    return NextResponse.json(admin)
}
