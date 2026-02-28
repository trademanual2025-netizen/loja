"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  images: string[];
  bannerUrl: string | null;
  category: { id: string; name: string } | null;
  variants: { id: string; name: string; price: number | null; stock: number }[];
  options: { id: string; name: string; values: string[] }[];
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch(`/api/products/${params.slug}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Produto não encontrado.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const variant = product.variants.find((v) => v.id === selectedVariant);
  const price = variant?.price ?? product.price;

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find(
      (i: { productId: string; variantId: string | null }) =>
        i.productId === product.id && i.variantId === (selectedVariant ?? null)
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        variantId: selectedVariant ?? null,
        name: product.name,
        variantName: variant?.name ?? null,
        price,
        image: product.images[0] ?? null,
        quantity,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    router.push("/carrinho");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Loja
          </Link>
          <Link href="/carrinho" className="text-gray-600 hover:text-gray-900">
            Carrinho
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {product.images[0] ? (
              <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-gray-400">Sem imagem</span>
              </div>
            )}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-16 h-16 rounded border-2 overflow-hidden ${
                      selectedImage === i
                        ? "border-blue-500"
                        : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            {product.category && (
              <p className="text-sm text-gray-500 mb-4">
                {product.category.name}
              </p>
            )}
            <div className="flex items-center gap-3 mb-4">
              {product.comparePrice && (
                <span className="text-lg text-gray-400 line-through">
                  R$ {product.comparePrice.toFixed(2)}
                </span>
              )}
              <span className="text-3xl font-bold text-gray-900">
                R$ {price.toFixed(2)}
              </span>
            </div>

            {product.description && (
              <p className="text-gray-600 mb-6">{product.description}</p>
            )}

            {product.variants.length > 0 && (
              <div className="mb-4">
                <p className="font-medium mb-2">Variante</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v.id)}
                      className={`px-3 py-1 rounded border ${
                        selectedVariant === v.id
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-700"
                      }`}
                    >
                      {v.name}
                      {v.price && ` - R$ ${v.price.toFixed(2)}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6 flex items-center gap-3">
              <label className="font-medium">Quantidade:</label>
              <div className="flex items-center border rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-1">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={addToCart}
              disabled={product.stock === 0}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {product.stock === 0 ? "Sem estoque" : "Adicionar ao carrinho"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
