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
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '')
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

        const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'https://giovanadiasjewelry.com.br'

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
        name: 'Pix – aguardando pagamento',
        trigger: WA_TRIGGERS.ORDER_PIX_PENDING,
        delayMinutes: 0,
        message: `Olá, *{{nome}}*! 💛\n\nRecebemos o seu pedido *#{{pedido}}* e ele está aguardando o pagamento via *Pix*.\n\n💰 *Valor a pagar:* R$ {{total}}\n\nPara pagar, acesse o link abaixo e escaneie o QR Code ou copie o código Pix:\n👉 {{link_pedido}}\n\n⏳ O QR Code expira em *30 minutos*. Após esse prazo, você pode gerar um novo pedido.\n\nAssim que o pagamento for confirmado, você receberá uma nova mensagem. ✨\n\n_Giovana Dias – Joias Autorais_`,
    },
    {
        name: 'Boleto – aguardando pagamento',
        trigger: WA_TRIGGERS.ORDER_BOLETO_PENDING,
        delayMinutes: 0,
        message: `Olá, *{{nome}}*! 💛\n\nSeu boleto para o pedido *#{{pedido}}* foi gerado com sucesso.\n\n💰 *Valor:* R$ {{total}}\n\nAcesse o link abaixo para visualizar ou imprimir seu boleto:\n👉 {{link_pedido}}\n\n⚠️ *Atenção:* O boleto vence em *3 dias úteis*. Após o pagamento, a compensação pode levar até 3 dias bancários.\n\nQualquer dúvida, estamos aqui para ajudar. 💛\n\n_Giovana Dias – Joias Autorais_`,
    },
    {
        name: 'Pagamento confirmado',
        trigger: WA_TRIGGERS.ORDER_PAID,
        delayMinutes: 0,
        message: `✅ *Pagamento confirmado!*\n\nOlá, *{{nome}}*! Recebemos o seu pagamento e o pedido *#{{pedido}}* já está em produção. 🎉\n\n💎 *Produto:* {{produto}}\n💰 *Total pago:* R$ {{total}}\n\nEstamos preparando sua joia com todo o cuidado e carinho que ela merece. ✨\n\nEm breve você receberá o código de rastreio. Acompanhe seu pedido aqui:\n👉 {{link_pedido}}\n\n_Giovana Dias – Joias Autorais_`,
    },
    {
        name: 'Pedido enviado',
        trigger: WA_TRIGGERS.ORDER_SHIPPED,
        delayMinutes: 0,
        message: `🚚 *Seu pedido está a caminho!*\n\nOlá, *{{nome}}*! O pedido *#{{pedido}}* acabou de ser despachado. 📦\n\n🔍 *Código de rastreio:* \`{{rastreio}}\`\n\nVocê pode acompanhar a entrega diretamente pelo link do seu pedido:\n👉 {{link_pedido}}\n\nFique de olho nas atualizações dos Correios. Estamos ansiosas para saber o que você achou! 💛\n\n_Giovana Dias – Joias Autorais_`,
    },
    {
        name: 'Pedido entregue',
        trigger: WA_TRIGGERS.ORDER_DELIVERED,
        delayMinutes: 0,
        message: `🎁 *Seu pedido foi entregue!*\n\nOlá, *{{nome}}*! O pedido *#{{pedido}}* chegou até você.\n\n💎 *{{produto}}*\n\nEsperamos que chegou com tudo certinho e que você ame cada detalhe. ✨\n\nSe gostar, nos marque nas fotos — adoramos ver nossas joias ganhando vida! 📸\n\nQualquer problema, acesse:\n👉 {{link_pedido}}\n\nMuito obrigada pela confiança. Até a próxima! 💛\n\n_Giovana Dias – Joias Autorais_`,
    },
    {
        name: 'Pedido cancelado',
        trigger: WA_TRIGGERS.ORDER_CANCELLED,
        delayMinutes: 0,
        message: `Olá, *{{nome}}*. 😔\n\nO pedido *#{{pedido}}* foi cancelado.\n\nSe você não solicitou o cancelamento ou tiver alguma dúvida, entre em contato conosco respondendo esta mensagem. Vamos resolver juntos!\n\nSe quiser fazer um novo pedido:\n👉 {{link_pedido}}\n\n_Giovana Dias – Joias Autorais_`,
    },
    {
        name: 'Boas-vindas – novo cadastro',
        trigger: WA_TRIGGERS.NEW_LEAD,
        delayMinutes: 0,
        message: `Olá, *{{nome}}*! 💛\n\nSeja muito bem-vinda à *Giovana Dias – Joias Autorais*! ✨\n\nÉ um prazer ter você aqui. Cada peça da nossa coleção é criada com dedicação e amor, pensada para realçar a sua beleza.\n\n🛍️ Explore nossa loja e encontre sua próxima joia favorita:\n👉 https://giovanadiasjewelry.com.br/loja\n\nQualquer dúvida, é só chamar! 😊\n\n_Giovana Dias – Joias Autorais_`,
    },
    {
        name: 'Lembrete de carrinho (30 min após cadastro)',
        trigger: WA_TRIGGERS.NEW_LEAD,
        delayMinutes: 30,
        message: `Oi, *{{nome}}*! 😊\n\nNotei que você ainda não finalizou sua compra. Sua joia está esperando por você! 💎\n\nNão perca os itens que você escolheu:\n👉 https://giovanadiasjewelry.com.br/carrinho\n\nSe tiver qualquer dúvida sobre tamanho, material ou prazo de entrega, é só responder aqui. Estou à disposição! 💛\n\n_Giovana Dias – Joias Autorais_`,
    },
    {
        name: 'Reembolso aprovado',
        trigger: WA_TRIGGERS.REFUND_APPROVED,
        delayMinutes: 0,
        message: `Olá, *{{nome}}*. ✅\n\nSeu pedido de reembolso referente ao pedido *#{{pedido}}* foi *aprovado*.\n\nO valor será estornado conforme a forma de pagamento original, em até *10 dias úteis* dependendo da operadora.\n\nSe tiver alguma dúvida, estamos aqui. 💛\n\n_Giovana Dias – Joias Autorais_`,
    },
    {
        name: 'Reembolso não aprovado',
        trigger: WA_TRIGGERS.REFUND_REJECTED,
        delayMinutes: 0,
        message: `Olá, *{{nome}}*. 😔\n\nInfelizmente o pedido de reembolso referente ao pedido *#{{pedido}}* não pôde ser aprovado no momento.\n\nResponda esta mensagem para falarmos diretamente e encontrarmos a melhor solução para você. Queremos resolver! 💛\n\n_Giovana Dias – Joias Autorais_`,
    },
]
