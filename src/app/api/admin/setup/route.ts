import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { setSetting, SETTINGS_KEYS } from '@/lib/config'
import crypto from 'crypto'
import { sign } from 'jsonwebtoken'

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'admin-secret-change-in-production'

// GET — verifica se setup já foi feito
export async function GET() {
    try {
        const done = await prisma.settings.findUnique({ where: { key: SETTINGS_KEYS.ADMIN_SETUP_DONE } })
        return NextResponse.json({ setupDone: done?.value === 'true' })
    } catch {
        return NextResponse.json({ setupDone: false })
    }
}

// POST — executa o setup inicial do admin
export async function POST(req: NextRequest) {
    try {
        const { adminEmail, adminPassword, adminName, storeName } = await req.json()

        if (!adminEmail || !adminPassword) {
            return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 })
        }

        // Verificar se admin já existe
        const existing = await prisma.adminUser.findUnique({ where: { email: adminEmail } })
        if (existing) {
            return NextResponse.json({ error: 'Admin já configurado.' }, { status: 409 })
        }

        const crypto = await import('crypto')
        const hashed = crypto.createHash('sha256').update(adminPassword).digest('hex')
        await prisma.adminUser.create({
            data: { email: adminEmail, password: hashed, name: adminName || 'Admin' },
        })

        await setSetting(SETTINGS_KEYS.STORE_NAME, storeName || 'Minha Loja')
        await setSetting(SETTINGS_KEYS.ADMIN_SETUP_DONE, 'true')

        const token = sign({ email: adminEmail, role: 'admin' }, ADMIN_SECRET, { expiresIn: '30d' })
        const response = NextResponse.json({ ok: true })
        response.cookies.set('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
        })

        return response
    } catch (err: any) {
        console.error("ERRO COMPLETO NO SETUP:", err?.message || err)
        console.error("STACK:", err?.stack)
        return NextResponse.json({ error: 'Erro ao configurar. ' + (err?.message || '') }, { status: 500 })
    }
}
