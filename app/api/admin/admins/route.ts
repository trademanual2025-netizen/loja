import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admins = await prisma.adminUser.findMany({
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(admins);
}

export async function POST(req: Request) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email, password } = await req.json();
  const hash = await bcrypt.hash(password, 10);
  const newAdmin = await prisma.adminUser.create({
    data: {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      name,
      email,
      password: hash,
    },
  });
  return NextResponse.json({ id: newAdmin.id, name: newAdmin.name });
}
