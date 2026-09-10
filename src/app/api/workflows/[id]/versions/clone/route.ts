/**
 * ============================================================================
 * Atlas Commerce OS — Workflow Version Clone REST API Endpoint
 * ============================================================================
 * Specification Reference: M11-003 / API-001 / IAM-002
 * Route: POST /api/workflows/:id/versions/clone
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../../../lib/auth";
import { authorizationService } from "../../../../../../services/authorization.service";
import { workflowService } from "../../../../../../services/workflow.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "workflow:write")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const versionNumber = Number(body.versionNumber || body.version);

    if (!versionNumber || isNaN(versionNumber)) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity", details: "versionNumber parameter is required" },
        { status: 422 }
      );
    }

    const cloned = await workflowService.workflow.cloneVersion(
      session.companyId,
      id,
      versionNumber,
      body.newName,
      session.userId
    );

    return NextResponse.json({ success: true, data: cloned }, { status: 201 });
  } catch (error: any) {
    const status = error.message?.includes("not found") ? 404 : 400;
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status }
    );
  }
}
