/**
 * ============================================================================
 * Ondrio Commerce OS — Purchasing Report REST API Endpoint Handler
 * ============================================================================
 * Specification Reference: M10-003 / API-001 / IAM-002
 * Route: GET /api/reporting/purchasing
 * Delegation: 100% to purchasingReportService (0% Prisma / 0% Repositories)
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { purchasingReportService } from "@/services/reporting.service";
import { PurchasingReportQuerySchema } from "@/types/reporting.dto";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "reports:read")) {
      return NextResponse.json({ success: false, error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const rawQuery = {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      supplierId: searchParams.get("supplierId") || undefined,
      status: searchParams.get("status") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const parseResult = PurchasingReportQuerySchema.safeParse(rawQuery);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity - Invalid query parameters", details: parseResult.error.format() },
        { status: 422 }
      );
    }

    const [spend, scorecards, trend, leadTimes, receiving] = await Promise.all([
      purchasingReportService.purchasingKPIs(session, parseResult.data),
      purchasingReportService.supplierScorecards(session, parseResult.data),
      purchasingReportService.procurementSpend(session, parseResult.data),
      purchasingReportService.supplierLeadTimes(session),
      purchasingReportService.receivingPerformance(session, parseResult.data),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        spend,
        scorecards,
        trend,
        leadTimes,
        receiving,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
