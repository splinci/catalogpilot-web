/**
 * ============================================================================
 * Splinci Commerce OS — SLO Risk Predictions REST API
 * ============================================================================
 * Specification Reference: CI-005 / API-004 / PREDICTIVE-001 / IAM-002
 * Route: GET /api/operations/predictive/slo-risk
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

    const sloRisk = await operationsService.predictive.getSLORiskPredictions(session.companyId);
    return NextResponse.json({ success: true, data: sloRisk });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
