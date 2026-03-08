import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { dictionaries, Locale, defaultLocale, translateDb } from '@/lib/i18n'
import { PaymentInfo } from '@/components/store/PaymentInfo'
import { ChangePaymentMethod } from '@/components/store/ChangePaymentMethod'
import { getAuthUser } from '@/lib/auth'

export default async function PedidoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const cookieStore = await cookies()
    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale
    const locale = localeCookie && dictionaries[localeCookie] ? localeCookie : defaultLocale
    const dict = dictionaries[locale]

    const order = await prisma.order.findUnique({
        where: { id },
        select: {
            id: true,
            status: true,
            subtotal: true,
            discount: true,
            total: true,
            shippingCost: true,
            gateway: true,
            gatewayData: true,
            createdAt: true,
            street: true,
            number: true,
            complement: true,
            neighborhood: true,
            city: true,
            state: true,
            zipCode: true,
            trackingCode: true,
            trackingUrl: true,
            shippingNote: true,
            user: { select: { name: true } },
            userId: true,
            items: {
                select: {
                    id: true,
                    quantity: true,
                    price: true,
                    variantId: true,
                    product: { select: { id: true, name: true, slug: true, images: true } },
                    variant: { select: { name: true } },
                },
            },
        },
    })

    if (!order) redirect('/')

    const authUser = await getAuthUser()
    const isOwner = authUser?.id === order.userId

    let gatewayData: Record<string, any> = {}
    if (order.gatewayData) {
        try { gatewayData = JSON.parse(order.gatewayData) } catch {}
    }

    const orderItemsForCart = order.items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.price,
        image: item.product.images?.[0] || '',
        quantity: item.quantity,
        variantId: item.variantId || undefined,
        variantName: item.variant?.name || undefined,
    }))

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 16px', textAlign: 'center' }}>
            <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                {order.status === 'PAID' ? (
                    <>
                        <CheckCircle2 size={72} color="#22c55e" />
                        <h1 style={{ fontWeight: 800, fontSize: '2rem', marginBottom: 0 }}>{dict.order.confirmed}</h1>
                    </>
                ) : order.status === 'PENDING' ? (
                    <>
                        <Clock size={72} color="#eab308" />
                        <h1 style={{ fontWeight: 800, fontSize: '2rem', marginBottom: 0 }}>Aguardando Pagamento</h1>
                    </>
                ) : order.status === 'CANCELLED' ? (
                    <>
                        <AlertCircle size={72} color="#ef4444" />
                        <h1 style={{ fontWeight: 800, fontSize: '2rem', marginBottom: 0 }}>Pedido Cancelado</h1>
                    </>
                ) : (
                    <>
                        <AlertCircle size={72} color="#8b5cf6" />
                        <h1 style={{ fontWeight: 800, fontSize: '2rem', marginBottom: 0 }}>Status: {order.status}</h1>
                    </>
                )}
            </div>

            <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
                {dict.order.thanks}, {order.user.name}! {dict.order.yourOrder} #{order.id.slice(-8).toUpperCase()} {dict.order.received}
            </p>

            {order.status === 'PENDING' && (
                <PaymentInfo
                    gateway={order.gateway}
                    gatewayData={gatewayData}
                    createdAt={order.createdAt.toISOString()}
                    orderId={isOwner ? order.id : undefined}
                    orderItems={isOwner ? orderItemsForCart : undefined}
                />
            )}

            {order.status === 'PENDING' && isOwner && (
                <ChangePaymentMethod orderId={order.id} orderItems={orderItemsForCart} />
            )}

            {order.status === 'CANCELLED' && gatewayData.cancelledReason === 'user_changed_payment_method' && (
                <div className="card" style={{ textAlign: 'left', marginBottom: 24, border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.06)' }}>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        Este pedido foi cancelado porque você optou por alterar a forma de pagamento. Os produtos foram restaurados ao carrinho para finalizar um novo pedido.
                    </p>
                </div>
            )}

            {order.status === 'CANCELLED' && gatewayData.statusDetail && gatewayData.cancelledReason !== 'user_changed_payment_method' && (
                <div className="card" style={{ textAlign: 'left', marginBottom: 24, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ef4444', marginBottom: 8 }}>Motivo</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{getStatusDetailLabel(gatewayData.statusDetail)}</p>
                </div>
            )}

            <div className="card" style={{ textAlign: 'left', marginBottom: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{dict.order.items}</h3>
                {order.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--text-muted)' }}>
                        <span>{translateDb(item.product.name, locale)} × {item.quantity}</span>
                        <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                    </div>
                ))}
                <hr className="divider" />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--text-muted)' }}>
                    <span>{dict.order.shipping}</span>
                    <span>{order.shippingCost === 0 ? dict.checkout.freeShipping : `R$ ${order.shippingCost.toFixed(2).replace('.', ',')}`}</span>
                </div>
                {(order.discount ?? 0) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#22c55e', fontWeight: 600 }}>
                        <span>⚡ Desconto PIX</span>
                        <span>- R$ {order.discount!.toFixed(2).replace('.', ',')}</span>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
                    <span>{dict.order.total}</span>
                    <span style={{ color: 'var(--primary)' }}>R$ {order.total.toFixed(2).replace('.', ',')}</span>
                </div>
            </div>

            <div className="card" style={{ textAlign: 'left', marginBottom: 32 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>{dict.order.shippingAddress}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    {order.street}{order.number ? `, ${order.number}` : ''}{order.complement ? `, ${order.complement}` : ''}<br />
                    {order.neighborhood ? `${order.neighborhood} – ` : ''}{order.city}{order.state ? `/${order.state}` : ''}<br />
                    {order.zipCode}
                </p>
                {order.trackingCode && (
                    <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(34,197,94,0.08)', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)' }}>
                        <p style={{ fontSize: '0.82rem', color: '#22c55e', fontWeight: 600 }}>
                            Rastreio: <span style={{ fontFamily: 'monospace' }}>{order.trackingCode}</span>
                            {order.trackingUrl && (
                                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8, color: 'var(--primary)' }}>Rastrear →</a>
                            )}
                        </p>
                    </div>
                )}
                {order.shippingNote && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8 }}>{order.shippingNote}</p>
                )}
            </div>

            <a href="/loja" className="btn btn-primary">{dict.store.continueShopping}</a>
        </div>
    )
}

function getStatusDetailLabel(detail: string): string {
    const labels: Record<string, string> = {
        accredited: 'Pagamento aprovado',
        pending_contingency: 'Pagamento em processamento',
        pending_review_manual: 'Pagamento em análise manual',
        cc_rejected_bad_filled_card_number: 'Número do cartão incorreto',
        cc_rejected_bad_filled_date: 'Data de validade incorreta',
        cc_rejected_bad_filled_other: 'Dados do cartão incorretos',
        cc_rejected_bad_filled_security_code: 'Código de segurança incorreto',
        cc_rejected_blacklist: 'Cartão não autorizado',
        cc_rejected_call_for_authorize: 'Ligue para a operadora do cartão para autorizar',
        cc_rejected_card_disabled: 'Cartão desativado. Ligue para a operadora',
        cc_rejected_card_error: 'Erro no cartão. Tente outro cartão',
        cc_rejected_duplicated_payment: 'Pagamento duplicado. Já existe uma transação com este valor',
        cc_rejected_high_risk: 'Pagamento recusado por risco de fraude',
        cc_rejected_insufficient_amount: 'Saldo insuficiente no cartão',
        cc_rejected_invalid_installments: 'Número de parcelas inválido',
        cc_rejected_max_attempts: 'Limite de tentativas excedido. Use outro cartão',
        cc_rejected_other_reason: 'Pagamento recusado pela operadora',
        pending_waiting_payment: 'Aguardando pagamento',
        pending_waiting_transfer: 'Aguardando transferência',
    }
    return labels[detail] || detail
}
