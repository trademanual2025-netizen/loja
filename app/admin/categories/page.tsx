"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => {
        if (r.status === 401) router.push("/admin/login");
        return r.json();
      })
      .then(setCategories)
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/categories", {
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
    setCategories([...categories, data]);
    setForm({ name: "", slug: "" });
    toast.success("Categoria criada!");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir categoria?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories(categories.filter((c) => c.id !== id));
      toast.success("Excluída!");
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
        <h1 className="text-2xl font-bold mb-6">Categorias</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Nome"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Slug"
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Adicionar
          </button>
        </form>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {categories.map((cat) => (
            <div key={cat.id} className="flex justify-between items-center px-4 py-3 border-b last:border-0">
              <div>
                <p className="font-medium">{cat.name}</p>
                <p className="text-sm text-gray-500">{cat.slug}</p>
              </div>
              <button
                onClick={() => handleDelete(cat.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Excluir
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-gray-500 text-center py-8">Nenhuma categoria.</p>
          )}
        </div>
      </main>
    </div>
  );
}
