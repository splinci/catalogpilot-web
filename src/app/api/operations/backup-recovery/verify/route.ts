/**
 * ============================================================================
 * Splinci Commerce OS — Verify Backup Metadata REST API
 * ============================================================================
 * Specification Reference: CI-008 / API-004 / BACKUP-001 / IAM-002
 * Route: POST /api/operations/backup-recovery/verify
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

    const backups = await operationsService.backupRecovery.discoverAvailableBackups(session.companyId);
    return NextResponse.json({ success: true, data: { verifiedCount: backups.length, backups } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
