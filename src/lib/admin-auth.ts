import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || ''

export const ALL_MODULES = [
    'dashboard', 'products', 'categories', 'orders', 'cupons', 'reembolsos',
    'leads', 'comunicacao', 'mensagens', 'admins', 'integracoes', 'settings',
    'tracking', 'webhooks', 'frete', 'embed', 'perfil',
] as const

export type AdminModule = typeof ALL_MODULES[number]

export interface AdminInfo {
    email: string
    role: 'superadmin' | 'admin'
    permissions: string[]
}

function decodeToken(token: string): { email: string; role: string } | null {
    if (!ADMIN_SECRET) return null
    try {
        const payload = verify(token, ADMIN_SECRET) as { email: string; role: string }
        if (payload.role !== 'admin' && payload.role !== 'superadmin') return null
        return payload
    } catch {
        return null
    }
}

export async function getAdminEmailFromCookie(): Promise<string | null> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('admin_token')?.value
        if (!token) return null
        const payload = decodeToken(token)
        return payload?.email ?? null
    } catch {
        return null
    }
}

export function getAdminEmailFromRequest(req: NextRequest): string | null {
    const token = req.cookies.get('admin_token')?.value
    if (!token) return null
    const payload = decodeToken(token)
    return payload?.email ?? null
}

export async function getAdminInfoFromRequest(req: NextRequest): Promise<AdminInfo | null> {
    const email = getAdminEmailFromRequest(req)
    if (!email) return null
    const admin = await prisma.adminUser.findUnique({
        where: { email },
        select: { role: true, permissions: true },
    })
    if (!admin) return null
    return {
        email,
        role: admin.role as 'superadmin' | 'admin',
        permissions: admin.permissions,
    }
}

export function isSuperAdmin(info: AdminInfo): boolean {
    return info.role === 'superadmin'
}

export function hasPermission(info: AdminInfo, module: AdminModule): boolean {
    if (info.role === 'superadmin') return true
    return info.permissions.includes(module)
}

export async function requirePermission(req: NextRequest, module: AdminModule): Promise<AdminInfo | null> {
    const info = await getAdminInfoFromRequest(req)
    if (!info) return null
    if (!hasPermission(info, module)) return null
    return info
}

export function verifyAdminToken(req: NextRequest): boolean {
    return !!getAdminEmailFromRequest(req)
}

export function unauthorizedResponse() {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
}

export function forbiddenResponse() {
    return NextResponse.json({ error: 'Sem permissão para acessar este recurso.' }, { status: 403 })
}
