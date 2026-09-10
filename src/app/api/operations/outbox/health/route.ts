/**
 * ============================================================================
 * Splinci Commerce OS — Outbox Queue Health REST API
 * ============================================================================
 * Specification Reference: M12-003 / API-001 / IAM-002
 * Route: GET /api/operations/outbox/health
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../../lib/auth";
import { authorizationService } from "../../../../../services/authorization.service";
import { operationsService } from "../../../../../services/operations.service";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "operations:read")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const queueHealth = await operationsService.outbox.getQueueHealth(session.companyId);
    return NextResponse.json({ success: true, data: queueHealth });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
