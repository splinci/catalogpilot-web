/**
 * ============================================================================
 * Atlas Commerce OS — Workflow Version History REST API Endpoint
 * ============================================================================
 * Specification Reference: M11-003 / API-001 / IAM-002
 * Route: GET /api/workflows/:id/versions, POST /api/workflows/:id/versions
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../../lib/auth";
import { authorizationService } from "../../../../../services/authorization.service";
import { workflowService } from "../../../../../services/workflow.service";
import { CreateWorkflowVersionSchema } from "../../../../../types/workflow.dto";

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
    const versions = await workflowService.workflow.listVersions(session.companyId, id);

    return NextResponse.json({ success: true, data: versions });
  } catch (error: any) {
    const status = error.message?.includes("not found") ? 404 : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status }
    );
  }
}

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

    const parsed = CreateWorkflowVersionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity", details: parsed.error.format() },
        { status: 422 }
      );
    }

    const createdVersion = await workflowService.workflow.createVersion(
      session.companyId,
      id,
      parsed.data,
      session.userId
    );

    return NextResponse.json({ success: true, data: createdVersion }, { status: 201 });
  } catch (error: any) {
    const status = error.message?.includes("not found") ? 404 : 400;
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status }
    );
  }
}
