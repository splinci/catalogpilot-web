/**
 * ============================================================================
 * Ondrio Commerce OS — Executive Dashboard REST API Endpoint Handler
 * ============================================================================
 * Specification Reference: M10-003 / API-001 / IAM-002
 * Route: GET /api/reporting/dashboard
 * Delegation: 100% to dashboardService (0% Prisma / 0% Repositories)
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { dashboardService } from "@/services/reporting.service";
import { DashboardQuerySchema } from "@/types/reporting.dto";

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
      warehouseId: searchParams.get("warehouseId") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
    };

    const parseResult = DashboardQuerySchema.safeParse(rawQuery);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity - Invalid query parameters", details: parseResult.error.format() },
        { status: 422 }
      );
    }

    const data = await dashboardService.getExecutiveDashboard(session, parseResult.data);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
