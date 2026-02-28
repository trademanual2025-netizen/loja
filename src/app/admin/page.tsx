import { prisma } from '@/lib/prisma'
import { ShoppingBag, Users, DollarSign, TrendingUp } from 'lucide-react'

export default async function AdminDashboard() {
    const [orderCount, leadCount, revenueAgg, recentOrders] = await Promise.all([
        prisma.order.count(),
        prisma.lead.count(),
        prisma.order.aggregate({
            where: { status: 'PAID' },
            _sum: { total: true },
            _count: true,
        }),
        prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                total: true,
                status: true,
                gateway: true,
                user: { select: { name: true } },
            },
        }),
    ])

    const revenue = revenueAgg._sum.total || 0
    const paidCount = revenueAgg._count || 0

    const stats = [
        { label: 'Receita Total', value: `R$ ${revenue.toFixed(2).replace('.', ',')}`, icon: DollarSign, color: '#22c55e' },
        { label: 'Pedidos', value: orderCount, icon: ShoppingBag, color: '#6366f1' },
        { label: 'Leads', value: leadCount, icon: Users, color: '#a855f7' },
        { label: 'Ticket Médio', value: paidCount > 0 ? `R$ ${(revenue / paidCount).toFixed(2).replace('.', ',')}` : 'R$ 0,00', icon: TrendingUp, color: '#eab308' },
    ]

    return (
        <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 28 }}>Dashboard</h1>
            <div className="grid-4" style={{ marginBottom: 32 }}>
                {stats.map((s) => (
                    <div key={s.label} className="card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{s.label}</span>
                            <div style={{ padding: 8, borderRadius: 8, background: `${s.color}20` }}>
                                <s.icon size={20} color={s.color} />
                            </div>
                        </div>
                        <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="card">
                <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Últimos Pedidos</h2>
                {recentOrders.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>Nenhum pedido ainda.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-muted)', fontSize: '0.82rem', borderBottom: '1px solid var(--border)' }}>
                                {['ID', 'Cliente', 'Total', 'Status', 'Gateway'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600 }}>{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((o) => (
                                <tr key={o.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.88rem' }}>
                                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{o.id.slice(-8).toUpperCase()}</td>
                                    <td style={{ padding: '10px 12px' }}>{o.user.name}</td>
                                    <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--primary)' }}>R$ {o.total.toFixed(2).replace('.', ',')}</td>
                                    <td style={{ padding: '10px 12px' }}>
                                        <span className={`badge ${o.status === 'PAID' ? 'badge-green' : o.status === 'CANCELLED' ? 'badge-red' : 'badge-yellow'}`}>
                                            {o.status === 'PAID' ? 'Pago' : o.status === 'CANCELLED' ? 'Cancelado' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{o.gateway}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
