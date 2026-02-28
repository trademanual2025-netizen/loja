"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CartItem {
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string | null;
  price: number;
  image: string | null;
  quantity: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
  }, []);

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const removeItem = (productId: string, variantId: string | null) => {
    updateCart(
      cart.filter(
        (i) => !(i.productId === productId && i.variantId === variantId)
      )
    );
  };

  const updateQuantity = (
    productId: string,
    variantId: string | null,
    quantity: number
  ) => {
    if (quantity < 1) {
      removeItem(productId, variantId);
      return;
    }
    updateCart(
      cart.map((i) =>
        i.productId === productId && i.variantId === variantId
          ? { ...i, quantity }
          : i
      )
    );
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Loja
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Carrinho</h1>
        {cart.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">Seu carrinho está vazio.</p>
            <Link href="/" className="text-blue-600 hover:underline">
              Continuar comprando
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm"
                >
                  {item.image ? (
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    {item.variantName && (
                      <p className="text-sm text-gray-500">{item.variantName}</p>
                    )}
                    <p className="text-blue-600 font-medium">
                      R$ {item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.variantId,
                          item.quantity - 1
                        )
                      }
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-3 py-1">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.variantId,
                          item.quantity + 1
                        )
                      }
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      removeItem(item.productId, item.variantId)
                    }
                    className="text-red-400 hover:text-red-600 ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">
                  R$ {total.toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => router.push("/checkout")}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Finalizar compra
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
