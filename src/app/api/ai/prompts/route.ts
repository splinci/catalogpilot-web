/**
 * ============================================================================
 * Ondrio Commerce OS — AI Prompts REST API Endpoint Handler
 * ============================================================================
 * Specification Reference: M9-003 / API-001 / IAM-002
 * Route: GET /api/ai/prompts, POST /api/ai/prompts
 * Delegation: 100% to aiService.prompt (0% Prisma / 0% Repositories)
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { aiService } from "@/services/ai.service";
import { PromptTemplateSchema, PromptQuerySchema } from "@/types/ai-catalog.dto";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "ai:read")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const pageRaw = searchParams.get("page");
    const limitRaw = searchParams.get("limit");
    const parsedQuery = PromptQuerySchema.safeParse({
      page: pageRaw ? pageRaw : undefined,
      limit: limitRaw ? limitRaw : undefined,
      type: searchParams.get("type") || undefined,
      isPublished: searchParams.get("isPublished") || undefined,
      search: searchParams.get("search") || undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity", details: parsedQuery.error.format() },
        { status: 422 }
      );
    }

    const result = await aiService.prompt.findTemplates(session.companyId, parsedQuery.data);

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

    if (!authorizationService.hasPermission(session.role, "ai:write")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = PromptTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity", details: parsed.error.format() },
        { status: 422 }
      );
    }

    const template = await aiService.prompt.createTemplate(session.companyId, session.userId, parsed.data);

    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
