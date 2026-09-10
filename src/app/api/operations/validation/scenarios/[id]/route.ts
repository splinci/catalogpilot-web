/**
 * ============================================================================
 * Splinci Commerce OS — Validation Scenario Detail REST API
 * ============================================================================
 * Specification Reference: CI-007 / API-003 / VALIDATION-001 / IAM-002
 * Route: GET /api/operations/validation/scenarios/[id]
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../../../lib/auth";
import { authorizationService } from "../../../../../../services/authorization.service";
import { operationsService } from "../../../../../../services/operations.service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "operations:read")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const scenario = await operationsService.validation.getValidationScenario(id, session.companyId);
    if (!scenario) {
      return NextResponse.json({ success: false, error: "Validation scenario not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: scenario });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
