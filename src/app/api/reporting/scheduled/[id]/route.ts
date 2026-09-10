/**
 * ============================================================================
 * Ondrio Commerce OS — Scheduled Report Item REST API Endpoint Handler
 * ============================================================================
 * Specification Reference: M10-003 / API-001 / IAM-002
 * Route: GET / PUT / DELETE /api/reporting/scheduled/[id]
 * Delegation: 100% to scheduledReportService (0% Prisma / 0% Repositories)
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { scheduledReportService } from "@/services/reporting.service";
import { ScheduledReportSchema } from "@/types/reporting.dto";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "reports:read")) {
      return NextResponse.json({ success: false, error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }

    const { id } = await params;
    const schedule = await scheduledReportService.findById(session, id);
    if (!schedule) {
      return NextResponse.json({ success: false, error: "Scheduled report not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: schedule });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (
      !authorizationService.hasPermission(session.role, "reports:write") &&
      !authorizationService.hasPermission(session.role, "reports:schedule")
    ) {
      return NextResponse.json({ success: false, error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parseResult = ScheduledReportSchema.partial().safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity - Invalid update payload", details: parseResult.error.format() },
        { status: 422 }
      );
    }

    const updated = await scheduledReportService.updateSchedule(session, id, parseResult.data);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Scheduled report not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (
      !authorizationService.hasPermission(session.role, "reports:write") &&
      !authorizationService.hasPermission(session.role, "reports:schedule")
    ) {
      return NextResponse.json({ success: false, error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }

    const { id } = await params;
    const deleted = await scheduledReportService.deleteSchedule(session, id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Scheduled report not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { deletedId: id } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
