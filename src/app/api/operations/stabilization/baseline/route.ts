/**
 * ============================================================================
 * Splinci Commerce OS — Production Baseline Capture REST API
 * ============================================================================
 * Specification Reference: GO-002 / API-007 / STABILIZATION-001 / IAM-002
 * Route: POST /api/operations/stabilization/baseline
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

    const snapshot = await operationsService.goLive.captureBaseline(session.companyId);
    return NextResponse.json({ success: true, data: snapshot });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
