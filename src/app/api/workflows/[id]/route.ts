/**
 * ============================================================================
 * Atlas Commerce OS — Workflow Definition Detail REST API Endpoint
 * ============================================================================
 * Specification Reference: M11-003 / API-001 / IAM-002
 * Route: GET /api/workflows/:id, PUT /api/workflows/:id, DELETE /api/workflows/:id
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../lib/auth";
import { authorizationService } from "../../../../services/authorization.service";
import { workflowService } from "../../../../services/workflow.service";
import { UpdateWorkflowSchema } from "../../../../types/workflow.dto";

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
    const workflow = await workflowService.workflow.getWorkflow(session.companyId, id);

    return NextResponse.json({ success: true, data: workflow });
  } catch (error: any) {
    const status = error.message?.includes("not found") ? 404 : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status }
    );
  }
}

export async function PUT(
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

    const parsed = UpdateWorkflowSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity", details: parsed.error.format() },
        { status: 422 }
      );
    }

    const expectedVersion = body.expectedVersion || body.version;

    const updated = await workflowService.workflow.updateWorkflow(
      session.companyId,
      id,
      parsed.data,
      session.userId,
      expectedVersion
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    let status = 400;
    if (error.message?.includes("concurrency") || error.message?.includes("stale")) {
      status = 409;
    } else if (error.message?.includes("not found")) {
      status = 404;
    }
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status }
    );
  }
}

export async function DELETE(
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
    const archived = await workflowService.workflow.archiveWorkflow(
      session.companyId,
      id,
      session.userId
    );

    return NextResponse.json({ success: true, data: archived });
  } catch (error: any) {
    const status = error.message?.includes("not found") ? 404 : 400;
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status }
    );
  }
}
