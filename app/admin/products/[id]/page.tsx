"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  price: string;
  comparePrice: string;
  stock: string;
  images: string;
  bannerUrl: string;
  active: boolean;
  categoryId: string;
}

export default function AdminProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === "new";

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductForm>({
    name: "",
    slug: "",
    description: "",
    price: "",
    comparePrice: "",
    stock: "0",
    images: "",
    bannerUrl: "",
    active: true,
    categoryId: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => {
        if (r.status === 401) router.push("/admin/login");
        return r.json();
      })
      .then(setCategories);

    if (!isNew) {
      fetch(`/api/admin/products/${id}`)
        .then((r) => r.json())
        .then((p) => {
          setForm({
            name: p.name ?? "",
            slug: p.slug ?? "",
            description: p.description ?? "",
            price: String(p.price ?? ""),
            comparePrice: String(p.comparePrice ?? ""),
            stock: String(p.stock ?? 0),
            images: (p.images ?? []).join("\n"),
            bannerUrl: p.bannerUrl ?? "",
            active: p.active ?? true,
            categoryId: p.categoryId ?? "",
          });
        });
    }
  }, [id, isNew, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      price: parseFloat(form.price),
      comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
      stock: parseInt(form.stock),
      images: form.images
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      bannerUrl: form.bannerUrl || null,
      active: form.active,
      categoryId: form.categoryId || null,
    };
    const res = await fetch(
      isNew ? "/api/admin/products" : `/api/admin/products/${id}`,
      {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      toast.error(d.error || "Erro");
      return;
    }
    toast.success(isNew ? "Produto criado!" : "Salvo!");
    router.push("/admin/products");
  };

  const handleDelete = async () => {
    if (!confirm("Excluir produto?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Excluído!");
      router.push("/admin/products");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin/products" className="text-xl font-bold">← Produtos</Link>
          {!isNew && (
            <button onClick={handleDelete} className="text-red-500 hover:text-red-700 text-sm">
              Excluir produto
            </button>
          )}
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{isNew ? "Novo produto" : "Editar produto"}</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          {[
            { label: "Nome", name: "name", type: "text" },
            { label: "Slug", name: "slug", type: "text" },
            { label: "Preço (R$)", name: "price", type: "number" },
            { label: "Preço comparativo (R$)", name: "comparePrice", type: "number" },
            { label: "Estoque", name: "stock", type: "number" },
            { label: "Banner URL", name: "bannerUrl", type: "text" },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                required={["name", "slug", "price"].includes(name)}
                value={form[name as keyof ProductForm] as string}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagens (uma URL por linha)
            </label>
            <textarea
              rows={3}
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              Produto ativo
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Salvando..." : isNew ? "Criar produto" : "Salvar"}
          </button>
        </form>
      </main>
    </div>
  );
}
