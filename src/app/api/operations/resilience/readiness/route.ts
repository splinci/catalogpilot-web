/**
 * ============================================================================
 * Splinci Commerce OS — Recovery Readiness REST API
 * ============================================================================
 * Specification Reference: CI-006 / API-002 / RESILIENCE-001 / IAM-002
 * Route: GET /api/operations/resilience/readiness
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

    const readiness = await operationsService.resilience.getRecoveryReadiness(session.companyId);
    return NextResponse.json({ success: true, data: readiness });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
