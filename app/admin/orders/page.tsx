import { getAdminFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const admin = await getAdminFromCookie();
  if (!admin) redirect("/admin/login");

  const orders = await prisma.order.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/admin" className="text-xl font-bold">Admin</Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Pedidos</h1>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Gateway</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/pedido/${order.id}`} className="text-blue-600 hover:underline">
                      #{order.id.slice(-8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{order.user.name}</td>
                  <td className="px-4 py-3">{order.gateway}</td>
                  <td className="px-4 py-3">R$ {order.total.toFixed(2)}</td>
                  <td className="px-4 py-3">{statusLabel[order.status] ?? order.status}</td>
                  <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="text-gray-500 text-center py-8">Nenhum pedido.</p>
          )}
        </div>
      </main>
    </div>
  );
}
