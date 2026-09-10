/**
 * ============================================================================
 * Splinci Commerce OS — Outbox Retry REST API
 * ============================================================================
 * Specification Reference: M12-003 / API-001 / IAM-002
 * Route: POST /api/operations/outbox/:id/retry
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../../../lib/auth";
import { authorizationService } from "../../../../../../services/authorization.service";
import { operationsService } from "../../../../../../services/operations.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "operations:retry")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Outbox ID is required" }, { status: 400 });
    }

    const retried = await operationsService.outbox.retryMessage(
      {
        companyId: session.companyId,
        outboxId: id,
      },
      session.userId
    );

    return NextResponse.json({ success: true, data: retried });
  } catch (error: any) {
    const isConflict = error.message?.includes("policy") || error.message?.includes("limit");
    return NextResponse.json(
      { success: false, error: error.message || "Outbox retry failed" },
      { status: isConflict ? 409 : 400 }
    );
  }
}
