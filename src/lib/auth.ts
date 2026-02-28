import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || ''

export interface AuthUser {
    id: string
    name: string
    email: string
    avatarUrl?: string | null
}

export async function getAuthUser(): Promise<AuthUser | null> {
    if (!JWT_SECRET) return null
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return null
        const payload = verify(token, JWT_SECRET) as AuthUser & { iat: number; exp: number }
        const dbUser = await prisma.user.findUnique({
            where: { id: payload.id },
            select: { avatarUrl: true, active: true },
        })
        if (!dbUser || !dbUser.active) return null
        return {
            id: payload.id,
            name: payload.name,
            email: payload.email,
            avatarUrl: dbUser.avatarUrl ?? null,
        }
    } catch {
        return null
    }
}
