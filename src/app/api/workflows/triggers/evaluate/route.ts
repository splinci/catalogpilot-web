/**
 * ============================================================================
 * Atlas Commerce OS — Workflow Trigger Evaluation REST API Endpoint
 * ============================================================================
 * Specification Reference: M11-003 / API-001 / IAM-002
 * Route: POST /api/workflows/triggers/evaluate
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../../lib/auth";
import { authorizationService } from "../../../../../services/authorization.service";
import { workflowService } from "../../../../../services/workflow.service";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "workflow:read")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const eventName = body.eventName || body.event;
    if (!eventName) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity", details: "eventName parameter is required" },
        { status: 422 }
      );
    }

    const result = await workflowService.trigger.evaluateTriggers(
      session.companyId,
      eventName,
      body.payload || body.data
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 400 }
    );
  }
}
