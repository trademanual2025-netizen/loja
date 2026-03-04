import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || ''

async function getAdminFromToken(req: NextRequest) {
    if (!ADMIN_SECRET) return null
    const token = req.cookies.get('admin_token')?.value
    if (!token) return null
    try {
        const payload = verify(token, ADMIN_SECRET) as { email: string }
        return await prisma.adminUser.findUnique({
            where: { email: payload.email },
            select: { id: true, name: true, email: true, avatarUrl: true },
        })
    } catch {
        return null
    }
}

export async function GET(req: NextRequest) {
    const admin = await getAdminFromToken(req)
    if (!admin) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    return NextResponse.json(admin)
}

export async function PATCH(req: NextRequest) {
    const admin = await getAdminFromToken(req)
    if (!admin) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

    const body = await req.json()
    const data: { name?: string; avatarUrl?: string | null } = {}
    if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim()
    if ('avatarUrl' in body) data.avatarUrl = body.avatarUrl

    const updated = await prisma.adminUser.update({
        where: { id: admin.id },
        data,
        select: { id: true, name: true, email: true, avatarUrl: true },
    })
    return NextResponse.json(updated)
}
