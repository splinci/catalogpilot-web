/**
 * ============================================================================
 * Splinci Commerce OS — Historical Telemetry REST API
 * ============================================================================
 * Specification Reference: CI-004 / API-001 / OBS-001 / IAM-002
 * Route: GET /api/operations/telemetry/history
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../../lib/auth";
import { authorizationService } from "../../../../../services/authorization.service";
import { operationsService } from "../../../../../services/operations.service";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "operations:read")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const metricName = searchParams.get("metricName") || "DB_LATENCY";
    const window = (searchParams.get("window") as "24h" | "7d" | "30d") || "24h";

    const history = await operationsService.telemetryHistory.getTimeSeriesHistory(
      metricName,
      window,
      session.companyId
    );

    return NextResponse.json({ success: true, data: history });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
