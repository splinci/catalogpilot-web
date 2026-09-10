import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/observability/logger";

export const runtime = "nodejs";

export async function GET() {
  let isDbHealthy = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    isDbHealthy = true;
  } catch (error: any) {
    logger.error("Health endpoint database ping failed", {
      errorCode: "HEALTH_DB_CHECK_FAILED",
      error: error?.message,
    });
  }

  return NextResponse.json(
    {
      success: isDbHealthy,
      status: isDbHealthy ? "healthy" : "unhealthy",
      checks: {
        application: "healthy",
        database: isDbHealthy ? "healthy" : "unhealthy",
      },
      timestamp: new Date().toISOString(),
    },
    { status: isDbHealthy ? 200 : 503 }
  );
}
