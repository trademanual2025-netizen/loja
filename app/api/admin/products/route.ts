import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const product = await prisma.product.create({
    data: {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: data.price,
      comparePrice: data.comparePrice,
      stock: data.stock ?? 0,
      images: data.images ?? [],
      bannerUrl: data.bannerUrl,
      active: data.active ?? true,
      categoryId: data.categoryId || null,
    },
  });
  return NextResponse.json(product);
}
