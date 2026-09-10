/**
 * ============================================================================
 * Splinci Commerce OS — Outbox Purge REST API
 * ============================================================================
 * Specification Reference: M12-003 / API-001 / IAM-002
 * Route: POST /api/operations/outbox/purge
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../../lib/auth";
import { authorizationService } from "../../../../../services/authorization.service";
import { operationsService } from "../../../../../services/operations.service";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "operations:manage")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    let daysOlderThan = 7;
    try {
      const body = await req.json();
      if (body?.daysOlderThan && typeof body.daysOlderThan === "number") {
        daysOlderThan = body.daysOlderThan;
      }
    } catch {
      // Use default 7 days if body is empty
    }

    const purged = await operationsService.outbox.purgeProcessedMessages(
      session.companyId,
      daysOlderThan
    );

    return NextResponse.json({ success: true, data: { count: purged.count, daysOlderThan } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 400 }
    );
  }
}
