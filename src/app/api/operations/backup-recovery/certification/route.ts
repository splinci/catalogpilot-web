/**
 * ============================================================================
 * Splinci Commerce OS — DR Certification Status REST API
 * ============================================================================
 * Specification Reference: CI-008 / API-008 / BACKUP-001 / IAM-002
 * Route: GET /api/operations/backup-recovery/certification
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

    const certification = await operationsService.backupRecovery.getCertificationStatus(session.companyId);
    return NextResponse.json({ success: true, data: certification });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
