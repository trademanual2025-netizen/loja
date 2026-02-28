import { prisma } from "./prisma";

export async function sendWebhook(
  url: string,
  type: string,
  payload: Record<string, unknown>,
  orderId?: string,
  leadId?: string
) {
  let status: number | undefined;
  let success = false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    status = res.status;
    success = res.ok;
  } catch {}

  await prisma.webhookLog.create({
    data: {
      id: Math.random().toString(36).slice(2),
      type,
      url,
      payload: JSON.stringify(payload),
      status,
      success,
      orderId,
      leadId,
    },
  });
}
