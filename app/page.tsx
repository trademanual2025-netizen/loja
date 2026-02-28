import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Loja
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/carrinho" className="text-gray-600 hover:text-gray-900">
              Carrinho
            </Link>
            <Link href="/auth" className="text-gray-600 hover:text-gray-900">
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Produtos</h1>
        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-16">
            Nenhum produto disponível.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/produto/${product.slug}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {product.images[0] && (
                  <div className="relative h-48 bg-gray-100">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-semibold text-gray-800 truncate">
                    {product.name}
                  </h2>
                  {product.category && (
                    <p className="text-sm text-gray-500">
                      {product.category.name}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    {product.comparePrice && (
                      <span className="text-sm text-gray-400 line-through">
                        R$ {product.comparePrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-lg font-bold text-gray-900">
                      R$ {product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
