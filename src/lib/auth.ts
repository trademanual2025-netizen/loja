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

const userCache = new Map<string, { avatarUrl: string | null; active: boolean; ts: number }>()
const CACHE_TTL = 60_000

export async function getAuthUser(): Promise<AuthUser | null> {
    if (!JWT_SECRET) return null
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return null
        const payload = verify(token, JWT_SECRET) as AuthUser & { iat: number; exp: number }

        const cached = userCache.get(payload.id)
        const now = Date.now()
        let dbData: { avatarUrl: string | null; active: boolean }

        if (cached && now - cached.ts < CACHE_TTL) {
            dbData = cached
        } else {
            const dbUser = await prisma.user.findUnique({
                where: { id: payload.id },
                select: { avatarUrl: true, active: true },
            })
            if (!dbUser) return null
            dbData = { avatarUrl: dbUser.avatarUrl, active: dbUser.active }
            userCache.set(payload.id, { ...dbData, ts: now })
        }

        if (!dbData.active) return null

        return {
            id: payload.id,
            name: payload.name,
            email: payload.email,
            avatarUrl: dbData.avatarUrl,
        }
    } catch {
        return null
    }
}
