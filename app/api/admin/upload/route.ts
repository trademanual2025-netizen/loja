import { NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ error: "Upload not configured" }, { status: 501 });
}
