import { NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";
import { getSettings, setSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function POST(req: Request) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  for (const [key, value] of Object.entries(data)) {
    await setSetting(key, String(value));
  }
  return NextResponse.json({ success: true });
}
