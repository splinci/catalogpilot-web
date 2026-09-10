/**
 * ============================================================================
 * Ondrio Commerce OS — AI Classification REST API Endpoint Handler
 * ============================================================================
 * Specification Reference: M9-003 / API-001 / IAM-002
 * Route: POST /api/ai/classification
 * Delegation: 100% to aiService.classification (0% Prisma / 0% Repositories)
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { aiService } from "@/services/ai.service";
import { ClassifyProductSchema } from "@/types/ai-catalog.dto";

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
    const parsed = ClassifyProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity", details: parsed.error.format() },
        { status: 422 }
      );
    }

    const result = await aiService.classification.classifyProduct(
      session.companyId,
      session.userId,
      parsed.data
    );

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
