import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../lib/auth";
import { requirePermission, PERMISSIONS } from "../../../lib/auth/permissions";
import { workflowService } from "../../../services/workflow.service";
import { CreateWorkflowSchema, WorkflowQuerySchema } from "../../../types/workflow.dto";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const auth = requirePermission(session, PERMISSIONS.WORKFLOW_READ);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const parsedQuery = WorkflowQuerySchema.safeParse({
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      search: searchParams.get("search") || undefined,
      workflowType: searchParams.get("workflowType") || undefined,
      isActive: searchParams.get("isActive") !== null ? searchParams.get("isActive") === "true" : undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity", details: parsedQuery.error.format() },
        { status: 422 }
      );
    }

    const result = await workflowService.workflow.listWorkflows(session.companyId, parsedQuery.data);

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

    const auth = requirePermission(session, PERMISSIONS.WORKFLOW_MANAGE);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CreateWorkflowSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity", details: parsed.error.format() },
        { status: 422 }
      );
    }

    const workflow = await workflowService.workflow.createWorkflow(
      session.companyId,
      parsed.data,
      session.userId
    );

    return NextResponse.json({ success: true, data: workflow }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 400 }
    );
  }
}
