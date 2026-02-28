import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'loja-secret-change-in-production'

export interface AuthUser {
    id: string
    name: string
    email: string
    avatarUrl?: string | null
}

/**
 * Reads and verifies the auth_token cookie, then fetches avatarUrl from DB.
 * Returns the user payload or null if unauthenticated / token invalid.
 * Safe to call in Server Components and Route Handlers.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return null
        const payload = verify(token, JWT_SECRET) as AuthUser & { iat: number; exp: number }
        // Fetch avatarUrl from DB (lean select, no extra overhead)
        const dbUser = await prisma.user.findUnique({
            where: { id: payload.id },
            select: { avatarUrl: true },
        })
        return {
            id: payload.id,
            name: payload.name,
            email: payload.email,
            avatarUrl: dbUser?.avatarUrl ?? null,
        }
    } catch {
        return null
    }
}
