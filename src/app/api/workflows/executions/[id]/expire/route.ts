/**
 * ============================================================================
 * Atlas Commerce OS — Execution Expire REST API Endpoint
 * ============================================================================
 * Specification Reference: M11-003 / API-001 / IAM-002
 * Route: POST /api/workflows/executions/:id/expire
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

    if (!authorizationService.hasPermission(session.role, "workflow:manage")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const result = await workflowService.approval.expireExecution(
      session.companyId,
      id,
      body.reason
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message?.includes("not found") ? 404 : 400;
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status }
    );
  }
}
