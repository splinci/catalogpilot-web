import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required for Prisma database initialization.");
}

const adapter = new PrismaNeon({ connectionString });

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

const createPrismaClient = () =>
  new PrismaClient({
    adapter,
  });

export const prisma =
  globalForPrisma.prisma && (globalForPrisma.prisma as any).company
    ? globalForPrisma.prisma
    : (globalForPrisma.prisma = createPrismaClient());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}