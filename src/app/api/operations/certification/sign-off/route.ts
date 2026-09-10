/**
 * ============================================================================
 * Splinci Commerce OS — Administrative Sign-Off REST API
 * ============================================================================
 * Specification Reference: CI-009 / API-011 / CERTIFICATION-001 / IAM-002
 * Route: POST /api/operations/certification/sign-off
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../../lib/auth";
import { authorizationService } from "../../../../../services/authorization.service";
import { operationsService } from "../../../../../services/operations.service";
import { CertificationSignOffRequestSchema } from "../../../../../types/operations-certification.dto";

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
    const parse = CertificationSignOffRequestSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: "Invalid sign-off payload", details: parse.error.format() },
        { status: 422 }
      );
    }

    const dashboard = await operationsService.certification.executeAdministrativeSignOff(
      parse.data,
      session.companyId,
      session.userId
    );

    return NextResponse.json({ success: true, data: dashboard });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Sign-off execution failed" },
      { status: 500 }
    );
  }
}
