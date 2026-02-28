import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
    const admins = await prisma.adminUser.findMany({
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true, email: true, createdAt: true },
    })
    return NextResponse.json({ admins })
}

export async function POST(req: NextRequest) {
    const { name, email, password } = await req.json()
    if (!name || !email || !password)
        return NextResponse.json({ error: 'Nome, e-mail e senha são obrigatórios.' }, { status: 400 })

    const existing = await prisma.adminUser.findUnique({ where: { email } })
    if (existing)
        return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 10)
    const admin = await prisma.adminUser.create({
        data: { name, email, password: hashed },
        select: { id: true, name: true, email: true, createdAt: true },
    })
    return NextResponse.json(admin)
}
