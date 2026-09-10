/**
 * ============================================================================
 * Atlas Commerce OS — Workflow Executions REST API Endpoint
 * ============================================================================
 * Specification Reference: M11-003 / API-001 / IAM-002
 * Route: GET /api/workflows/executions, POST /api/workflows/executions
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../lib/auth";
import { authorizationService } from "../../../../services/authorization.service";
import { workflowService } from "../../../../services/workflow.service";
import {
  CreateWorkflowExecutionSchema,
  WorkflowExecutionQuerySchema,
} from "../../../../types/workflow.dto";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "workflow:read")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const parsedQuery = WorkflowExecutionQuerySchema.safeParse({
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      definitionId: searchParams.get("definitionId") || undefined,
      status: searchParams.get("status") || undefined,
      triggerEvent: searchParams.get("triggerEvent") || undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity", details: parsedQuery.error.format() },
        { status: 422 }
      );
    }

    const result = await workflowService.execution.listExecutions(session.companyId, parsedQuery.data);

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "workflow:execute")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CreateWorkflowExecutionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity", details: parsed.error.format() },
        { status: 422 }
      );
    }

    const execution = await workflowService.execution.createExecution(
      session.companyId,
      parsed.data,
      session.userId
    );

    return NextResponse.json({ success: true, data: execution }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 400 }
    );
  }
}
