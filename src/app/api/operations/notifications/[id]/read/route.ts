/**
 * ============================================================================
 * Splinci Commerce OS — Mark Notification Read REST API
 * ============================================================================
 * Specification Reference: M12-003 / API-001 / IAM-002
 * Route: POST /api/operations/notifications/:id/read
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

    if (!authorizationService.hasPermission(session.role, "operations:read")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Notification ID is required" }, { status: 400 });
    }

    const updated = await operationsService.notifications.markAsRead(
      session.companyId,
      id,
      session.userId
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
