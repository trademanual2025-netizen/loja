import { getAdminFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminEmbedPage() {
  const admin = await getAdminFromCookie();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/admin" className="text-xl font-bold">Admin</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Embed / Widget</h1>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-600 mb-4">
            Cole o código abaixo no seu site para exibir os produtos.
          </p>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
            {`<iframe
  src="${process.env.NEXT_PUBLIC_URL ?? ""}/embed"
  width="100%"
  height="600"
  frameborder="0"
></iframe>`}
          </pre>
        </div>
      </main>
    </div>
  );
}
