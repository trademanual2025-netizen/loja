import { getAdminFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const admin = await getAdminFromCookie();
  if (!admin) redirect("/admin/login");

  const leads = await prisma.lead.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/admin" className="text-xl font-bold">Admin</Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Leads</h1>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Fonte</th>
                <th className="px-4 py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{lead.user.name}</td>
                  <td className="px-4 py-3">{lead.user.email}</td>
                  <td className="px-4 py-3">{lead.user.phone ?? "-"}</td>
                  <td className="px-4 py-3">{lead.source}</td>
                  <td className="px-4 py-3">{new Date(lead.createdAt).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && (
            <p className="text-gray-500 text-center py-8">Nenhum lead.</p>
          )}
        </div>
      </main>
    </div>
  );
}
