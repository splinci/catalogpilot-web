/**
 * ============================================================================
 * Splinci Commerce OS — System Setting by Key REST API
 * ============================================================================
 * Specification Reference: M12-003 / API-001 / IAM-002
 * Route: GET /api/operations/settings/:key
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../../lib/auth";
import { authorizationService } from "../../../../../services/authorization.service";
import { operationsService } from "../../../../../services/operations.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "operations:settings")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { key } = await params;
    if (!key) {
      return NextResponse.json({ success: false, error: "Setting key is required" }, { status: 400 });
    }

    const setting = await operationsService.settings.getSetting(session.companyId, key);
    if (!setting) {
      return NextResponse.json({ success: false, error: "System setting not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: setting });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
