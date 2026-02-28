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

const activeCache = new Map<string, { active: boolean; ts: number }>()
const ACTIVE_TTL = 60_000

export async function getAuthUser(): Promise<AuthUser | null> {
    if (!JWT_SECRET) return null
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return null
        const payload = verify(token, JWT_SECRET) as AuthUser & { iat: number; exp: number }

        const cached = activeCache.get(payload.id)
        const now = Date.now()
        let isActive: boolean

        if (cached && now - cached.ts < ACTIVE_TTL) {
            isActive = cached.active
        } else {
            const dbUser = await prisma.user.findUnique({
                where: { id: payload.id },
                select: { active: true },
            })
            isActive = dbUser?.active ?? false
            activeCache.set(payload.id, { active: isActive, ts: now })
        }

        if (!isActive) return null

        return {
            id: payload.id,
            name: payload.name,
            email: payload.email,
            avatarUrl: payload.avatarUrl ?? null,
        }
    } catch {
        return null
    }
}
