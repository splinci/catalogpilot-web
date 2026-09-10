/**
 * ============================================================================
 * Atlas Commerce OS — Workflow Activation REST API Endpoint
 * ============================================================================
 * Specification Reference: M11-003 / API-001 / IAM-002
 * Route: POST /api/workflows/:id/activate
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../../lib/auth";
import { authorizationService } from "../../../../../services/authorization.service";
import { workflowService } from "../../../../../services/workflow.service";

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
    const activated = await workflowService.workflow.activateWorkflow(
      session.companyId,
      id,
      session.userId
    );

    return NextResponse.json({ success: true, data: activated });
  } catch (error: any) {
    const status = error.message?.includes("not found") ? 404 : 400;
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status }
    );
  }
}
