import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      phone,
      cpf,
      zipCode,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      items,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const hash = await bcrypt.hash(password || "temp123", 10);
      user = await prisma.user.create({
        data: {
          id: Math.random().toString(36).slice(2) + Date.now().toString(36),
          email,
          password: hash,
          name,
          phone,
          cpf,
          zipCode,
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
        },
      });
    }

    const subtotal = items.reduce(
      (sum: number, i: { price: number; quantity: number }) =>
        sum + i.price * i.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        userId: user.id,
        gateway: "stripe",
        subtotal,
        total: subtotal,
        zipCode: zipCode || "",
        street: street || "",
        number: number || "",
        complement,
        neighborhood: neighborhood || "",
        city: city || "",
        state: state || "",
        items: {
          create: items.map(
            (i: {
              productId: string;
              variantId: string | null;
              price: number;
              quantity: number;
            }) => ({
              id:
                Math.random().toString(36).slice(2) +
                Date.now().toString(36),
              productId: i.productId,
              variantId: i.variantId || null,
              price: i.price,
              quantity: i.quantity,
            })
          ),
        },
      },
    });

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
