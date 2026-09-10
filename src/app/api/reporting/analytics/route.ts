/**
 * ============================================================================
 * Ondrio Commerce OS — Analytics REST API Endpoint Handler
 * ============================================================================
 * Specification Reference: M10-003 / API-001 / IAM-002
 * Route: GET /api/reporting/analytics
 * Delegation: 100% to analyticsService (0% Prisma / 0% Repositories)
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { analyticsService } from "@/services/reporting.service";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "reports:read")) {
      return NextResponse.json({ success: false, error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }

    const [trends, growth, variance, rollingAverages, benchmarking, health] = await Promise.all([
      analyticsService.getKPITrends(session),
      analyticsService.getGrowthAnalysis(session),
      analyticsService.getVarianceAnalysis(session),
      analyticsService.getRollingAverages(session),
      analyticsService.getPerformanceBenchmarking(session),
      analyticsService.calculateBusinessHealth(session),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        trends,
        growth,
        variance,
        rollingAverages,
        benchmarking,
        health,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
