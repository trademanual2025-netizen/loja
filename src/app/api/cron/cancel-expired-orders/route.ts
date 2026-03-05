import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { increaseStock } from '@/lib/inventory'

const FALLBACK_EXPIRY_HOURS = 24

export async function GET(req: NextRequest) {
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
        const authHeader = req.headers.get('authorization')
        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
        }
    }

    const now = new Date()
    const fallbackCutoff = new Date(now.getTime() - FALLBACK_EXPIRY_HOURS * 60 * 60 * 1000)

    const pendingOrders = await prisma.order.findMany({
        where: { status: 'PENDING' },
        include: { items: true },
    })

    let cancelled = 0
    let errors = 0

    for (const order of pendingOrders) {
        let gw: Record<string, unknown> = {}
        try { if (order.gatewayData) gw = JSON.parse(order.gatewayData) } catch {}

        let isExpired = false

        if (gw.expiresAt) {
            const expiresAt = new Date(gw.expiresAt as string)
            if (expiresAt < now) isExpired = true
        } else {
            if (order.createdAt < fallbackCutoff) isExpired = true
        }

        if (!isExpired) continue

        try {
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    status: 'CANCELLED',
                    gatewayData: JSON.stringify({
                        ...gw,
                        cancelledReason: 'expired',
                        cancelledAt: now.toISOString(),
                    }),
                },
            })

            if (gw.stockReserved === true) {
                await increaseStock(order.items)
            }

            cancelled++
            console.log(`[Cron] Pedido ${order.id} cancelado por expiração (gateway: ${order.gateway})`)
        } catch (err) {
            errors++
            console.error(`[Cron] Erro ao cancelar pedido ${order.id}:`, err)
        }
    }

    return NextResponse.json({
        ok: true,
        checked: pendingOrders.length,
        cancelled,
        errors,
        at: now.toISOString(),
    })
}
