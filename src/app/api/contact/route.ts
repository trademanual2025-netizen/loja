import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSettings, SETTINGS_KEYS } from '@/lib/config'
import { sendEmail, buildContactNotificationHtml } from '@/lib/email'

const RATE_LIMIT = 3
const WINDOW_MS = 10 * 60 * 1000
const ipLog = new Map<string, number[]>()

function getIP(req: NextRequest): string {
    return (
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        req.headers.get('x-real-ip') ||
        'unknown'
    )
}

function isRateLimited(ip: string): boolean {
    const now = Date.now()
    const timestamps = (ipLog.get(ip) || []).filter(t => now - t < WINDOW_MS)
    if (timestamps.length >= RATE_LIMIT) return true
    ipLog.set(ip, [...timestamps, now])
    return false
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, email, subject, message, _hp } = body

        if (_hp) {
            return NextResponse.json({ ok: true })
        }

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 })
        }

        const ip = getIP(req)
        if (isRateLimited(ip)) {
            return NextResponse.json({ error: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429 })
        }

        const saved = await prisma.contactMessage.create({
            data: { name, email, subject: subject || null, message },
        })

        const settings = await getSettings([
            SETTINGS_KEYS.CONTACT_NOTIFY_EMAIL,
            SETTINGS_KEYS.SMTP_HOST,
            SETTINGS_KEYS.SMTP_PORT,
            SETTINGS_KEYS.SMTP_USER,
            SETTINGS_KEYS.SMTP_PASS,
            SETTINGS_KEYS.SMTP_FROM,
        ])

        const notifyEmail = settings[SETTINGS_KEYS.CONTACT_NOTIFY_EMAIL]
        const smtpHost = settings[SETTINGS_KEYS.SMTP_HOST]
        const smtpUser = settings[SETTINGS_KEYS.SMTP_USER]
        const smtpPass = settings[SETTINGS_KEYS.SMTP_PASS]

        if (notifyEmail && smtpHost && smtpUser && smtpPass) {
            const receivedAt = new Date(saved.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
            const html = buildContactNotificationHtml({ name, email, subject, message, receivedAt })

            await sendEmail(
                {
                    to: notifyEmail,
                    subject: `[Contato] ${subject || 'Nova mensagem'} — ${name}`,
                    html,
                },
                {
                    host: smtpHost,
                    port: parseInt(settings[SETTINGS_KEYS.SMTP_PORT] || '587'),
                    user: smtpUser,
                    pass: smtpPass,
                    from: settings[SETTINGS_KEYS.SMTP_FROM] || smtpUser,
                }
            )
        }

        return NextResponse.json({ ok: true })
    } catch (err) {
        console.error('[CONTATO]', err)
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
    }
}
