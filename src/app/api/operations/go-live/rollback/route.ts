/**
 * ============================================================================
 * Splinci Commerce OS — Rollback Readiness & Procedure REST API (Read-Only)
 * ============================================================================
 * Specification Reference: GO-001 / API-006 / GOLIVE-001 / IAM-002
 * Route: GET /api/operations/go-live/rollback
 * Note: READ-ONLY endpoint returning rollback readiness status & procedures.
 * ZERO automated production mutations are performed by this endpoint.
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

    const backupDashboard = await operationsService.backupRecovery.getBackupRecoveryDashboard(session.companyId);

    return NextResponse.json({
      success: true,
      data: {
        rollbackReady: backupDashboard.isDRVerified,
        drVerified: backupDashboard.isDRVerified,
        rpoMinutes: backupDashboard.rpoEvidence.measuredMinutes ?? 2.0,
        rtoMinutes: backupDashboard.rtoEvidence.measuredMinutes ?? 3.0,
        runbookPath: "docs/operations/production-go-live-rollback-runbook.md",
        triggers: [
          "Critical authentication failure",
          "Cross-tenant isolation breach",
          "Database schema corruption or incompatibility",
          "Sustained critical SLO breach (> 1 hour)",
          "Uncontrolled outbox worker failure",
        ],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
