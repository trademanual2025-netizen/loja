import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function EmbedPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <div className="p-4 bg-white">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/produto/${product.slug}`}
            target="_blank"
            className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
          >
            {product.images[0] && (
              <div className="relative h-32 bg-gray-100">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-3">
              <p className="font-medium text-sm truncate">{product.name}</p>
              <p className="text-blue-600 font-bold text-sm">
                R$ {product.price.toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
