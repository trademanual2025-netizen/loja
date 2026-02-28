"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => {
        if (r.status === 401) router.push("/admin/login");
        return r.json();
      })
      .then(setSettings);
  }, [router]);

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setLoading(false);
    if (res.ok) toast.success("Salvo!");
    else toast.error("Erro ao salvar");
  };

  const setKey = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  const configKeys = [
    { key: "store_name", label: "Nome da loja" },
    { key: "stripe_public_key", label: "Stripe Public Key" },
    { key: "mercadopago_public_key", label: "MercadoPago Public Key" },
    { key: "webhook_url", label: "Webhook URL" },
    { key: "facebook_pixel_id", label: "Facebook Pixel ID" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/admin" className="text-xl font-bold">Admin</Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Configurações</h1>
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          {configKeys.map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <input
                type="text"
                value={settings[key] ?? ""}
                onChange={(e) => setKey(key, e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </main>
    </div>
  );
}
