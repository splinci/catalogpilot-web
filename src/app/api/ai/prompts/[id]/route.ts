/**
 * ============================================================================
 * Ondrio Commerce OS — AI Prompt Detail REST API Endpoint Handler
 * ============================================================================
 * Specification Reference: M9-003 / API-001 / IAM-002
 * Route: GET /api/ai/prompts/[id], PUT /api/ai/prompts/[id]
 * Delegation: 100% to aiService.prompt (0% Prisma / 0% Repositories)
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { aiService } from "@/services/ai.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "ai:read")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;
    const template = await aiService.prompt.findActiveTemplate(session.companyId, resolvedParams.id);
    if (!template) {
      return NextResponse.json({ success: false, error: "Prompt template not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: template });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
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

    if (!authorizationService.hasPermission(session.role, "ai:write")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;
    const body = await req.json();
    const template = await aiService.prompt.cloneTemplate(
      session.companyId,
      session.userId,
      resolvedParams.id,
      body?.code
    );

    return NextResponse.json({ success: true, data: template });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
