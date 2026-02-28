import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const count = await prisma.adminUser.count();
  if (count > 0) {
    return NextResponse.json({ error: "Setup already done" }, { status: 409 });
  }

  const { name, email, password } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);
  const admin = await prisma.adminUser.create({
    data: {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      name,
      email,
      password: hash,
    },
  });

  return NextResponse.json({ id: admin.id, name: admin.name });
}

export async function GET() {
  const count = await prisma.adminUser.count();
  return NextResponse.json({ needsSetup: count === 0 });
}
