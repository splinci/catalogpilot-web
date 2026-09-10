/**
 * ============================================================================
 * Ondrio Commerce OS — Scheduled Reports REST API Endpoint Handler
 * ============================================================================
 * Specification Reference: M10-003 / API-001 / IAM-002
 * Route: GET / POST /api/reporting/scheduled
 * Delegation: 100% to scheduledReportService (0% Prisma / 0% Repositories)
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { scheduledReportService } from "@/services/reporting.service";
import { ScheduledReportSchema, ScheduledReportQuerySchema } from "@/types/reporting.dto";

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
      domain: searchParams.get("domain") || undefined,
      frequency: searchParams.get("frequency") || undefined,
      isEnabled: searchParams.get("isEnabled") ? searchParams.get("isEnabled") === "true" : undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const parseResult = ScheduledReportQuerySchema.safeParse(rawQuery);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity - Invalid query parameters", details: parseResult.error.format() },
        { status: 422 }
      );
    }

    const data = await scheduledReportService.findSchedules(session, parseResult.data);

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

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const parseResult = ScheduledReportSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity - Invalid schedule payload", details: parseResult.error.format() },
        { status: 422 }
      );
    }

    const schedule = await scheduledReportService.createSchedule(session, parseResult.data);

    return NextResponse.json(
      { success: true, data: schedule },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
