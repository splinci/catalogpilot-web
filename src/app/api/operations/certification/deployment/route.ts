/**
 * ============================================================================
 * Splinci Commerce OS — Deployment Readiness REST API
 * ============================================================================
 * Specification Reference: CI-009 / API-006 / CERTIFICATION-001 / IAM-002
 * Route: GET /api/operations/certification/deployment
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

    const readiness = await operationsService.certification.calculateReadinessScore(session.companyId);
    return NextResponse.json({
      success: true,
      data: {
        deploymentReady: readiness.failedCriticalGatesCount === 0,
        score: readiness.totalScore,
        level: readiness.level,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
