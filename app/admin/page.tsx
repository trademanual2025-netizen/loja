import { getAdminFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const admin = await getAdminFromCookie();
  if (!admin) redirect("/admin/login");

  const [products, orders, users, leads] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.lead.count(),
  ]);

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { user: { select: { name: true, email: true } } },
  });

  const statusLabel: Record<string, string> = {
    PENDING: "Pendente",
    PAID: "Pago",
    CANCELLED: "Cancelado",
    REFUNDED: "Reembolsado",
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin</h1>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/products" className="text-gray-600 hover:text-gray-900">Produtos</Link>
            <Link href="/admin/categories" className="text-gray-600 hover:text-gray-900">Categorias</Link>
            <Link href="/admin/orders" className="text-gray-600 hover:text-gray-900">Pedidos</Link>
            <Link href="/admin/leads" className="text-gray-600 hover:text-gray-900">Leads</Link>
            <Link href="/admin/admins" className="text-gray-600 hover:text-gray-900">Admins</Link>
            <Link href="/admin/settings" className="text-gray-600 hover:text-gray-900">Config</Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900">Loja</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Produtos", value: products },
            { label: "Pedidos", value: orders },
            { label: "Clientes", value: users },
            { label: "Leads", value: leads },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl p-6 shadow-sm text-center">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-4">Pedidos recentes</h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500">Nenhum pedido.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Cliente</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-2">
                      <Link href={`/pedido/${order.id}`} className="text-blue-600 hover:underline">
                        #{order.id.slice(-8)}
                      </Link>
                    </td>
                    <td className="py-2">{order.user.name}</td>
                    <td className="py-2">R$ {order.total.toFixed(2)}</td>
                    <td className="py-2">{statusLabel[order.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
