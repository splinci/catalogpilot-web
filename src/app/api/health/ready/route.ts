import { NextResponse } from "next/server";
import { checkDatabaseReadiness } from "@/lib/infrastructure/databaseReadiness";

export const runtime = "nodejs";

export async function GET() {
  const dbReadiness = await checkDatabaseReadiness();
  const isReady = dbReadiness.status === "HEALTHY";

  return NextResponse.json(
    {
      status: isReady ? "HEALTHY" : "UNAVAILABLE",
      readiness: isReady,
      checks: {
        database: dbReadiness.status,
      },
      timestamp: new Date().toISOString(),
    },
    { status: isReady ? 200 : 503 }
  );
}
