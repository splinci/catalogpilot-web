/**
 * ============================================================================
 * Splinci Commerce OS — Execute Safe Validation Scenario REST API
 * ============================================================================
 * Specification Reference: CI-007 / API-004 / VALIDATION-001 / IAM-002
 * Route: POST /api/operations/validation/scenarios/[id]/run
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../../../../lib/auth";
import { authorizationService } from "../../../../../../../services/authorization.service";
import { operationsService } from "../../../../../../../services/operations.service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "operations:manage")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const evidence = await operationsService.validation.executeSafeValidation(id, session.companyId, session.userId);
    return NextResponse.json({ success: true, data: evidence });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
