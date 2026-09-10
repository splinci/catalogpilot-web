/**
 * ============================================================================
 * Atlas Commerce OS — Workflow Execution Detail REST API Endpoint
 * ============================================================================
 * Specification Reference: M11-003 / API-001 / IAM-002
 * Route: GET /api/workflows/executions/:id
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../../lib/auth";
import { authorizationService } from "../../../../../services/authorization.service";
import { workflowService } from "../../../../../services/workflow.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "workflow:read")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const execution = await workflowService.execution.getExecution(session.companyId, id);

    return NextResponse.json({ success: true, data: execution });
  } catch (error: any) {
    const status = error.message?.includes("not found") ? 404 : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status }
    );
  }
}
