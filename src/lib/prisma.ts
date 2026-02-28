import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

function createPrismaClient() {
    const rawUrl = (process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || '')
        .replace(/[&?]channel_binding=[^&]*/g, '')
        .replace(/sslmode=require/, 'sslmode=no-verify')
    const pool = new Pool({
        connectionString: rawUrl + (rawUrl.includes('uselibpqcompat') ? '' : (rawUrl.includes('?') ? '&' : '?') + 'uselibpqcompat=true'),
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
        max: 5,
        idleTimeoutMillis: 30000,
    })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

