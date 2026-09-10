/**
 * ============================================================================
 * Splinci Commerce OS — Outbox Queue Monitoring REST API
 * ============================================================================
 * Specification Reference: M12-003 / API-001 / IAM-002
 * Route: GET /api/operations/outbox
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../lib/auth";
import { authorizationService } from "../../../../services/authorization.service";
import { operationsService } from "../../../../services/operations.service";
import { OutboxQuerySchema } from "../../../../types/operations.dto";

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
    const parsedQuery = OutboxQuerySchema.safeParse({
      companyId: session.companyId,
      status: searchParams.get("status") || undefined,
      eventType: searchParams.get("eventType") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "50",
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity", details: parsedQuery.error.format() },
        { status: 422 }
      );
    }

    const result = await operationsService.outbox.listMessages(parsedQuery.data);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
