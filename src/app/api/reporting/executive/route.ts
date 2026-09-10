/**
 * ============================================================================
 * Ondrio Commerce OS — Executive KPI REST API Endpoint Handler
 * ============================================================================
 * Specification Reference: M10-003 / API-001 / IAM-002
 * Route: GET /api/reporting/executive
 * Delegation: 100% to executiveKPIService (0% Prisma / 0% Repositories)
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { executiveKPIService } from "@/services/reporting.service";
import { ExecutiveKPIQuerySchema } from "@/types/reporting.dto";

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
      domain: searchParams.get("domain") || undefined,
      comparePreviousPeriod: searchParams.get("comparePreviousPeriod") === "true",
    };

    const parseResult = ExecutiveKPIQuerySchema.safeParse(rawQuery);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity - Invalid query parameters", details: parseResult.error.format() },
        { status: 422 }
      );
    }

    const data = await executiveKPIService.getUnifiedExecutiveKPIs(session, parseResult.data);

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
