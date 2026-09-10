import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateEnvironmentConfig } from "@/lib/config/env";
import { logger } from "@/lib/observability/logger";

export const runtime = "nodejs";

export async function GET() {
  let isDbHealthy = false;
  const envConfig = validateEnvironmentConfig();

  try {
    await prisma.$queryRaw`SELECT 1`;
    isDbHealthy = true;
  } catch (error: any) {
    logger.error("Release readiness check failed: database unreachable", {
      errorCode: "RELEASE_DB_CHECK_FAILED",
      error: error?.message,
    });
  }

  const isReleaseReady = isDbHealthy && envConfig.isValid;

  return NextResponse.json(
    {
      success: isReleaseReady,
      status: isReleaseReady ? "release_ready" : "release_not_ready",
      checks: {
        application: "healthy",
        database: isDbHealthy ? "healthy" : "unhealthy",
        configuration: envConfig.isValid ? "valid" : "invalid",
      },
      timestamp: new Date().toISOString(),
    },
    { status: isReleaseReady ? 200 : 503 }
  );
}
