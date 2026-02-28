import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.type === "payment" && body.data?.id) {
      const orderId = body.external_reference;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "PAID", gatewayId: String(body.data.id) },
        });
      }
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
