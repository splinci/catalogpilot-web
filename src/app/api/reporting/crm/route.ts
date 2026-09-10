/**
 * ============================================================================
 * Ondrio Commerce OS — CRM Report REST API Endpoint Handler
 * ============================================================================
 * Specification Reference: M10-003 / API-001 / IAM-002
 * Route: GET /api/reporting/crm
 * Delegation: 100% to crmReportService (0% Prisma / 0% Repositories)
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { crmReportService } from "@/services/reporting.service";
import { CRMReportQuerySchema } from "@/types/reporting.dto";

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
      segment: searchParams.get("segment") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const parseResult = CRMReportQuerySchema.safeParse(rawQuery);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity - Invalid query parameters", details: parseResult.error.format() },
        { status: 422 }
      );
    }

    const [dashboard, growth, retention, ltv, segmentation, creditRisk] = await Promise.all([
      crmReportService.customerDashboard(session, parseResult.data),
      crmReportService.customerGrowth(session, parseResult.data),
      crmReportService.retentionMetrics(session, parseResult.data),
      crmReportService.LTVMetrics(session, parseResult.data),
      crmReportService.customerSegmentation(session, parseResult.data),
      crmReportService.creditRiskDashboard(session, parseResult.data),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        dashboard,
        growth,
        retention,
        ltv,
        segmentation,
        creditRisk,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
