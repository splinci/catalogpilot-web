/**
 * ============================================================================
 * Ondrio Commerce OS — Execute Scheduled Report REST API Endpoint Handler
 * ============================================================================
 * Specification Reference: M10-003 / API-001 / IAM-002
 * Route: POST /api/reporting/scheduled/[id]/run
 * Delegation: 100% to scheduledReportService (0% Prisma / 0% Repositories)
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { scheduledReportService } from "@/services/reporting.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (
      !authorizationService.hasPermission(session.role, "reports:execute") &&
      !authorizationService.hasPermission(session.role, "reports:write")
    ) {
      return NextResponse.json({ success: false, error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }

    const { id } = await params;
    const schedule = await scheduledReportService.findById(session, id);
    if (!schedule) {
      return NextResponse.json({ success: false, error: "Scheduled report not found" }, { status: 404 });
    }

    const executionResults = await scheduledReportService.executeScheduledReports();

    return NextResponse.json({
      success: true,
      data: {
        executedScheduleId: id,
        timestamp: new Date().toISOString(),
        executionResults,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
