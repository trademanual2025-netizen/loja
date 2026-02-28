"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CartItem {
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string | null;
  price: number;
  image: string | null;
  quantity: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    cpf: "",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    gateway: "stripe",
  });

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
  }, []);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Carrinho vazio");
      return;
    }
    setLoading(true);
    const endpoint =
      form.gateway === "stripe"
        ? "/api/checkout/stripe"
        : "/api/checkout/mercadopago";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items: cart }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(data.error || "Erro ao processar pedido");
      return;
    }
    if (data.url) {
      window.location.href = data.url;
    } else {
      localStorage.setItem("cart", "[]");
      router.push(`/pedido/${data.orderId}`);
    }
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
        <h1 className="text-2xl font-bold mb-6">Finalizar compra</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-lg">Dados pessoais</h2>
            {[
              { label: "Nome", name: "name", type: "text" },
              { label: "Email", name: "email", type: "email" },
              { label: "Senha", name: "password", type: "password" },
              { label: "Telefone", name: "phone", type: "tel" },
              { label: "CPF", name: "cpf", type: "text" },
            ].map(({ label, name, type }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  required={["name", "email", "password"].includes(name)}
                  value={form[name as keyof typeof form]}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-lg">Endereço de entrega</h2>
            {[
              { label: "CEP", name: "zipCode" },
              { label: "Rua", name: "street" },
              { label: "Número", name: "number" },
              { label: "Complemento", name: "complement" },
              { label: "Bairro", name: "neighborhood" },
              { label: "Cidade", name: "city" },
              { label: "Estado", name: "state" },
            ].map(({ label, name }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  name={name}
                  required={name !== "complement"}
                  value={form[name as keyof typeof form]}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Pagamento</h2>
            <select
              name="gateway"
              value={form.gateway}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="stripe">Cartão de crédito (Stripe)</option>
              <option value="mercadopago">MercadoPago</option>
            </select>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold">R$ {total.toFixed(2)}</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Processando..." : "Confirmar pedido"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
