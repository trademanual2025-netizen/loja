import { prisma } from './prisma'
import { getSettings } from './config'

export const WA_TRIGGERS = {
    ORDER_PIX_PENDING: 'order_pix_pending',
    ORDER_BOLETO_PENDING: 'order_boleto_pending',
    ORDER_PAID: 'order_paid',
    ORDER_SHIPPED: 'order_shipped',
    ORDER_DELIVERED: 'order_delivered',
    ORDER_CANCELLED: 'order_cancelled',
    NEW_LEAD: 'new_lead',
    REFUND_APPROVED: 'refund_approved',
    REFUND_REJECTED: 'refund_rejected',
} as const

export type WATrigger = typeof WA_TRIGGERS[keyof typeof WA_TRIGGERS]

export interface WATriggerContext {
    phone: string
    nome?: string
    pedido?: string
    total?: string
    rastreio?: string
    produto?: string
    link_pedido?: string
    orderId?: string
    userId?: string
    [key: string]: string | undefined
}

export function formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '')
    if (digits.startsWith('55') && digits.length >= 12) return digits
    if (digits.length === 11 || digits.length === 10) return `55${digits}`
    return digits
}

export function replaceVars(template: string, vars: Record<string, string | undefined>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

export async function sendWhatsAppRaw(phone: string, message: string): Promise<{ ok: boolean; error?: string }> {
    const settings = await getSettings(['evolution_api_url', 'evolution_api_key', 'evolution_instance_name'])
    const { evolution_api_url: url, evolution_api_key: key, evolution_instance_name: instance } = settings

    if (!url || !key || !instance) return { ok: false, error: 'Evolution API não configurada.' }

    const base = url.replace(/\/$/, '')
    const formattedPhone = formatPhone(phone)

    try {
        const res = await fetch(`${base}/message/sendText/${instance}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', apikey: key },
            body: JSON.stringify({ number: formattedPhone, text: message }),
            signal: AbortSignal.timeout(10000),
        })

        if (!res.ok) {
            const text = await res.text()
            return { ok: false, error: `HTTP ${res.status}: ${text.substring(0, 100)}` }
        }

        return { ok: true }
    } catch (err: any) {
        return { ok: false, error: err.message || 'Erro de conexão com Evolution API' }
    }
}

export async function triggerWhatsApp(trigger: WATrigger, ctx: WATriggerContext): Promise<void> {
    if (!ctx.phone) return

    try {
        const templates = await prisma.whatsAppTemplate.findMany({
            where: { trigger, active: true },
        })
        if (!templates.length) return

        const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'https://loja-eta-nine.vercel.app'

        for (const tpl of templates) {
            const vars: Record<string, string | undefined> = {
                nome: ctx.nome,
                pedido: ctx.pedido,
                total: ctx.total,
                rastreio: ctx.rastreio,
                produto: ctx.produto,
                link_pedido: ctx.orderId ? `${storeUrl}/pedido/${ctx.orderId}` : ctx.link_pedido,
            }

            const message = replaceVars(tpl.message, vars)
            const delayMs = (tpl.delayMinutes || 0) * 60 * 1000

            if (delayMs > 0) {
                await prisma.whatsAppQueue.create({
                    data: {
                        phone: ctx.phone,
                        message,
                        trigger,
                        sendAt: new Date(Date.now() + delayMs),
                        orderId: ctx.orderId,
                        userId: ctx.userId,
                    },
                })
            } else {
                const result = await sendWhatsAppRaw(ctx.phone, message)
                await prisma.whatsAppLog.create({
                    data: {
                        phone: ctx.phone,
                        trigger,
                        message,
                        status: result.ok ? 'sent' : 'failed',
                        error: result.error,
                        orderId: ctx.orderId,
                        userId: ctx.userId,
                    },
                })
            }
        }
    } catch (err) {
        console.error('[WhatsApp] triggerWhatsApp error:', err)
    }
}

export async function processWhatsAppQueue(): Promise<{ processed: number; failed: number }> {
    const pending = await prisma.whatsAppQueue.findMany({
        where: { sent: false, sendAt: { lte: new Date() } },
        take: 50,
    })

    let processed = 0
    let failed = 0

    for (const item of pending) {
        const result = await sendWhatsAppRaw(item.phone, item.message)
        await prisma.whatsAppQueue.update({ where: { id: item.id }, data: { sent: true } })
        await prisma.whatsAppLog.create({
            data: {
                phone: item.phone,
                trigger: item.trigger,
                message: item.message,
                status: result.ok ? 'sent' : 'failed',
                error: result.error,
                orderId: item.orderId,
                userId: item.userId,
            },
        })
        result.ok ? processed++ : failed++
    }

    return { processed, failed }
}

export const DEFAULT_TEMPLATES = [
    {
        name: 'Pix – QR Code gerado',
        trigger: WA_TRIGGERS.ORDER_PIX_PENDING,
        delayMinutes: 0,
        message: `Olá, {{nome}}! 👋\n\nSeu pedido *#{{pedido}}* foi gerado com sucesso.\n\n📱 *Pagamento via Pix*\nEscaneie o QR Code ou copie o código Pix no link abaixo e finalize o pagamento.\n\n🔗 {{link_pedido}}\n\n*Total:* R$ {{total}}\n\nAssim que o pagamento for confirmado, você receberá uma notificação. 💛`,
    },
    {
        name: 'Boleto – gerado',
        trigger: WA_TRIGGERS.ORDER_BOLETO_PENDING,
        delayMinutes: 0,
        message: `Olá, {{nome}}! 👋\n\nSeu boleto para o pedido *#{{pedido}}* está disponível.\n\n💰 *Valor:* R$ {{total}}\n🔗 Acesse o link para abrir ou imprimir o boleto:\n{{link_pedido}}\n\n⚠️ O boleto vence em 3 dias úteis. Após o pagamento, a confirmação pode levar até 3 dias.`,
    },
    {
        name: 'Pagamento confirmado',
        trigger: WA_TRIGGERS.ORDER_PAID,
        delayMinutes: 0,
        message: `✅ *Pagamento confirmado!*\n\nOlá, {{nome}}! Recebemos o pagamento do pedido *#{{pedido}}*.\n\n💛 Estamos preparando seu produto com todo carinho.\nEm breve você receberá o código de rastreio.\n\n🔗 Acompanhe seu pedido: {{link_pedido}}`,
    },
    {
        name: 'Pedido enviado',
        trigger: WA_TRIGGERS.ORDER_SHIPPED,
        delayMinutes: 0,
        message: `🚚 *Seu pedido foi enviado!*\n\nOlá, {{nome}}! O pedido *#{{pedido}}* saiu para entrega.\n\n📦 *Código de rastreio:* {{rastreio}}\n🔗 Rastreie pelo link: {{link_pedido}}\n\nQualquer dúvida, estamos aqui! 💛`,
    },
    {
        name: 'Pedido entregue',
        trigger: WA_TRIGGERS.ORDER_DELIVERED,
        delayMinutes: 0,
        message: `🎉 *Pedido entregue!*\n\nOlá, {{nome}}! Seu pedido *#{{pedido}}* foi entregue.\n\nEsperamos que você ame sua nova joia! ✨💛\n\nSe tiver alguma dúvida ou precisar de suporte, fale conosco.`,
    },
    {
        name: 'Pedido cancelado',
        trigger: WA_TRIGGERS.ORDER_CANCELLED,
        delayMinutes: 0,
        message: `Olá, {{nome}}. Seu pedido *#{{pedido}}* foi cancelado.\n\nSe você não solicitou o cancelamento ou tiver dúvidas, entre em contato conosco. Estamos à disposição. 💛`,
    },
    {
        name: 'Novo lead – boas-vindas',
        trigger: WA_TRIGGERS.NEW_LEAD,
        delayMinutes: 0,
        message: `Olá, {{nome}}! 💛\n\nObrigada por se cadastrar em nossa loja! Você tem produtos incríveis esperando por você.\n\n🛍️ Acesse nossa loja e confira:\nhttps://loja-eta-nine.vercel.app/loja`,
    },
    {
        name: 'Carrinho abandonado (30 min)',
        trigger: WA_TRIGGERS.NEW_LEAD,
        delayMinutes: 30,
        message: `Olá, {{nome}}! 😊\n\nVocê deixou alguns itens no carrinho. Que tal finalizar sua compra?\n\n🛒 Seu carrinho ainda está salvo:\nhttps://loja-eta-nine.vercel.app/carrinho\n\nQualquer dúvida, estamos aqui! 💛`,
    },
    {
        name: 'Reembolso aprovado',
        trigger: WA_TRIGGERS.REFUND_APPROVED,
        delayMinutes: 0,
        message: `Olá, {{nome}}. Seu pedido de reembolso referente ao pedido *#{{pedido}}* foi *aprovado*. ✅\n\nO valor será processado conforme nossa política. Qualquer dúvida, fale conosco. 💛`,
    },
    {
        name: 'Reembolso recusado',
        trigger: WA_TRIGGERS.REFUND_REJECTED,
        delayMinutes: 0,
        message: `Olá, {{nome}}. Infelizmente seu pedido de reembolso referente ao pedido *#{{pedido}}* não foi aprovado.\n\nEntre em contato conosco para entender melhor os motivos e encontrarmos a melhor solução. 💛`,
    },
]
