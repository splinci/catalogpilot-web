/**
 * ============================================================================
 * Atlas Commerce OS — Financial Analytics REST API Handler
 * ============================================================================
 * Specification Reference: FIN-004 / API-001 / IAM-002
 * Route: GET /api/finance/analytics
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { financeAnalyticsService } from "@/services/finance/finance-analytics.service";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "finance:read")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const metrics = await financeAnalyticsService.getSummaryMetrics(session.companyId);

    return NextResponse.json({ success: true, data: metrics });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
