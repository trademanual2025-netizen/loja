import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true, variant: true } },
      user: true,
    },
  });

  if (!order) notFound();

  const statusLabel: Record<string, string> = {
    PENDING: "Pendente",
    PAID: "Pago",
    CANCELLED: "Cancelado",
    REFUNDED: "Reembolsado",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Loja
          </Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Pedido #{order.id.slice(-8)}</h1>
        <p className="text-gray-500 mb-6">
          Status:{" "}
          <span className="font-medium text-gray-900">
            {statusLabel[order.status] ?? order.status}
          </span>
        </p>

        {order.trackingCode && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="font-semibold text-blue-800">Rastreamento</p>
            <p className="text-blue-700">{order.trackingCode}</p>
            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Rastrear envio
              </a>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <h2 className="font-semibold mb-4">Itens</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  {item.variant && (
                    <p className="text-sm text-gray-500">{item.variant.name}</p>
                  )}
                  <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                </div>
                <p className="font-medium">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>R$ {order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold mb-2">Endereço de entrega</h2>
          <p className="text-gray-600">
            {order.street}, {order.number}
            {order.complement ? `, ${order.complement}` : ""}
          </p>
          <p className="text-gray-600">
            {order.neighborhood} - {order.city}/{order.state}
          </p>
          <p className="text-gray-600">CEP: {order.zipCode}</p>
        </div>
      </main>
    </div>
  );
}
