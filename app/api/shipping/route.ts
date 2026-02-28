import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const zipCode = searchParams.get("zipCode");

  if (!zipCode) {
    return NextResponse.json({ error: "CEP obrigatório" }, { status: 400 });
  }

  return NextResponse.json([
    { name: "PAC", days: 7, price: 15.9 },
    { name: "SEDEX", days: 3, price: 29.9 },
  ]);
}
