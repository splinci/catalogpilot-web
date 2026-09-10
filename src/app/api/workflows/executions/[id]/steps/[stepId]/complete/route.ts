/**
 * ============================================================================
 * Atlas Commerce OS — Execution Step Complete REST API Endpoint
 * ============================================================================
 * Specification Reference: M11-003 / API-001 / IAM-002
 * Route: POST /api/workflows/executions/:id/steps/:stepId/complete
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { workflowService } from "@/services/workflow.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "workflow:execute")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id, stepId } = await params;
    const body = await req.json().catch(() => ({}));
    const stepName = body.stepName || stepId;

    const result = await workflowService.execution.completeStep(
      session.companyId,
      id,
      stepId,
      stepName,
      body.output,
      body.durationMs || 0
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
