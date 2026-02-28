import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const raw =
    process.env.NEON_DATABASE_URL ||
    "postgresql://neondb_owner:npg_hxj7qgkZuoI5@ep-nameless-wind-ac3q998i-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require";
  const connectionString = raw.replace(/[&?]channel_binding=[^&]*/g, "");
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
