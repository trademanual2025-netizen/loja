import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signUserToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      email,
      password: hash,
      name,
    },
  });

  const token = signUserToken({ id: user.id, email: user.email });
  const cookieStore = await cookies();
  cookieStore.set("user_token", token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}
