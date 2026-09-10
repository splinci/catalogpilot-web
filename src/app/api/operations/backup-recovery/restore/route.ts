/**
 * ============================================================================
 * Splinci Commerce OS — Execute Controlled Staging Restore REST API
 * ============================================================================
 * Specification Reference: CI-008 / API-005 / BACKUP-001 / IAM-002
 * Route: POST /api/operations/backup-recovery/restore
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../../lib/auth";
import { authorizationService } from "../../../../../services/authorization.service";
import { operationsService } from "../../../../../services/operations.service";
import { RestoreExerciseRequestSchema } from "../../../../../types/operations-backup.dto";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "operations:manage")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parse = RestoreExerciseRequestSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: "Invalid restore exercise payload", details: parse.error.format() },
        { status: 422 }
      );
    }

    const result = await operationsService.backupRecovery.executeStagingRestore(
      parse.data,
      session.companyId,
      session.userId
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message?.includes("SAFETY VIOLATION") ? 409 : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Restore execution failed" },
      { status }
    );
  }
}
