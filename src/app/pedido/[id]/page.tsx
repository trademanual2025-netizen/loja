import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { dictionaries, Locale, defaultLocale, translateDb } from '@/lib/i18n'

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
            total: true,
            shippingCost: true,
            street: true,
            number: true,
            complement: true,
            neighborhood: true,
            city: true,
            state: true,
            zipCode: true,
            user: { select: { name: true } },
            items: {
                select: {
                    id: true,
                    quantity: true,
                    price: true,
                    product: { select: { name: true } },
                },
            },
        },
    })

    if (!order) redirect('/')

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
                ) : (
                    <>
                        <AlertCircle size={72} color="#ef4444" />
                        <h1 style={{ fontWeight: 800, fontSize: '2rem', marginBottom: 0 }}>Status: {order.status}</h1>
                    </>
                )}
            </div>

            <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
                {dict.order.thanks}, {order.user.name}! {dict.order.yourOrder} #{order.id.slice(-8).toUpperCase()} {dict.order.received}
            </p>

            {order.status === 'PENDING' && (
                <div style={{ background: 'var(--badge-yellow-bg)', color: 'var(--badge-yellow-text)', padding: '16px 20px', borderRadius: 8, marginBottom: 32, fontWeight: 500, border: '1px solid currentColor', opacity: 0.9 }}>
                    <p style={{ marginBottom: 4 }}>Se você pagou via Pix ou Boleto, a confirmação pode levar algum tempo.</p>
                    <p style={{ fontSize: '0.9em' }}>Assim que o pagamento for confirmado, você receberá um email e o status aqui será atualizado.</p>
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
                    <span>{order.shippingCost === 0 ? 'GRÁTIS' : `R$ ${order.shippingCost.toFixed(2).replace('.', ',')}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
                    <span>{dict.order.total}</span>
                    <span style={{ color: 'var(--primary)' }}>R$ {order.total.toFixed(2).replace('.', ',')}</span>
                </div>
            </div>

            <div className="card" style={{ textAlign: 'left', marginBottom: 32 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>{dict.order.shippingAddress}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    {order.street}, {order.number}{order.complement ? `, ${order.complement}` : ''}<br />
                    {order.neighborhood} – {order.city}/{order.state}<br />
                    CEP: {order.zipCode}
                </p>
            </div>

            <a href="/" className="btn btn-primary">{dict.store.continueShopping}</a>
        </div>
    )
}
