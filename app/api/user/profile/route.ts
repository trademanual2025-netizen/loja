import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getUserFromCookie();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      cpf: true,
      zipCode: true,
      street: true,
      number: true,
      complement: true,
      neighborhood: true,
      city: true,
      state: true,
      avatarUrl: true,
    },
  });

  if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(dbUser);
}

export async function PUT(req: Request) {
  const user = await getUserFromCookie();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: data.name,
      phone: data.phone,
      cpf: data.cpf,
      zipCode: data.zipCode,
      street: data.street,
      number: data.number,
      complement: data.complement,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
    },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json(updated);
}
