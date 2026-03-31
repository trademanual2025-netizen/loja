import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminInfoFromRequest, unauthorizedResponse, forbiddenResponse, ALL_MODULES } from '@/lib/admin-auth'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
    const info = await getAdminInfoFromRequest(req)
    if (!info) return unauthorizedResponse()
    if (info.role !== 'superadmin' && !info.permissions.includes('admins')) return forbiddenResponse()

    const admins = await prisma.adminUser.findMany({
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true, email: true, role: true, permissions: true, createdAt: true },
    })
    return NextResponse.json({ admins, callerRole: info.role })
}

export async function POST(req: NextRequest) {
    const info = await getAdminInfoFromRequest(req)
    if (!info) return unauthorizedResponse()
    if (info.role !== 'superadmin') return forbiddenResponse()

    const { name, email, password } = await req.json()
    if (!name || !email || !password)
        return NextResponse.json({ error: 'Nome, e-mail e senha são obrigatórios.' }, { status: 400 })

    const existing = await prisma.adminUser.findUnique({ where: { email } })
    if (existing)
        return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 10)
    const admin = await prisma.adminUser.create({
        data: { name, email, password: hashed, role: 'admin', permissions: [...ALL_MODULES] },
        select: { id: true, name: true, email: true, role: true, permissions: true, createdAt: true },
    })
    return NextResponse.json(admin)
}
