"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface Admin {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function AdminAdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/admins")
      .then((r) => {
        if (r.status === 401) router.push("/admin/login");
        return r.json();
      })
      .then(setAdmins);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(data.error || "Erro");
      return;
    }
    toast.success("Admin criado!");
    setForm({ name: "", email: "", password: "" });
    const updated = await fetch("/api/admin/admins").then((r) => r.json());
    setAdmins(updated);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir admin?")) return;
    const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAdmins(admins.filter((a) => a.id !== id));
      toast.success("Excluído!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/admin" className="text-xl font-bold">Admin</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Administradores</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm mb-6 space-y-3">
          <h2 className="font-semibold">Novo admin</h2>
          {[
            { label: "Nome", name: "name", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Senha", name: "password", type: "password" },
          ].map(({ label, name, type }) => (
            <input
              key={name}
              type={type}
              placeholder={label}
              required
              value={form[name as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [name]: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Criar
          </button>
        </form>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {admins.map((a) => (
            <div key={a.id} className="flex justify-between items-center px-4 py-3 border-b last:border-0">
              <div>
                <p className="font-medium">{a.name}</p>
                <p className="text-sm text-gray-500">{a.email}</p>
              </div>
              <button
                onClick={() => handleDelete(a.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
