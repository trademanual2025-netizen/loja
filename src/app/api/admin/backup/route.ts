import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
    if (!verifyAdminToken(req)) return unauthorizedResponse()

    try {
        const [
            users,
            categories,
            products,
            orders,
            orderItems,
            leads,
            settings,
            adminUsers,
            contactMessages,
            webhookLogs,
            whatsappTemplates,
            refundRequests,
        ] = await Promise.all([
            prisma.user.findMany(),
            prisma.category.findMany(),
            prisma.product.findMany({ include: { options: true, variants: true } }),
            prisma.order.findMany({ include: { items: true } }),
            prisma.orderItem.findMany(),
            prisma.lead.findMany(),
            prisma.settings.findMany(),
            prisma.adminUser.findMany({ select: { id: true, email: true, name: true, createdAt: true } }),
            prisma.contactMessage.findMany(),
            prisma.webhookLog.findMany({ take: 500, orderBy: { createdAt: 'desc' } }),
            prisma.whatsAppTemplate.findMany(),
            prisma.refundRequest.findMany({ include: { messages: true } }),
        ])

        const backup = {
            exportedAt: new Date().toISOString(),
            version: '1.0',
            tables: {
                users: { count: users.length, data: users },
                adminUsers: { count: adminUsers.length, data: adminUsers },
                categories: { count: categories.length, data: categories },
                products: { count: products.length, data: products },
                orders: { count: orders.length, data: orders },
                orderItems: { count: orderItems.length, data: orderItems },
                leads: { count: leads.length, data: leads },
                settings: { count: settings.length, data: settings },
                contactMessages: { count: contactMessages.length, data: contactMessages },
                webhookLogs: { count: webhookLogs.length, data: webhookLogs },
                whatsappTemplates: { count: whatsappTemplates.length, data: whatsappTemplates },
                refundRequests: { count: refundRequests.length, data: refundRequests },
            },
        }

        const filename = `backup_giovana_${new Date().toISOString().slice(0, 10)}.json`

        return new NextResponse(JSON.stringify(backup, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        })
    } catch (err) {
        console.error('[Backup] Error:', err)
        return NextResponse.json({ error: 'Erro ao gerar backup' }, { status: 500 })
    }
}
