import { prisma } from "./prisma";

export async function getSetting(key: string): Promise<string | null> {
  const s = await prisma.settings.findUnique({ where: { key } });
  return s?.value ?? null;
}

export async function getSettings(): Promise<Record<string, string>> {
  const settings = await prisma.settings.findMany();
  return Object.fromEntries(settings.map((s) => [s.key, s.value]));
}

export async function setSetting(key: string, value: string) {
  return prisma.settings.upsert({
    where: { key },
    update: { value },
    create: { id: Math.random().toString(36).slice(2), key, value },
  });
}
