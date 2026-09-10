/**
 * ============================================================================
 * Ondrio Commerce OS — AI Content Approval REST API Endpoint Handler
 * ============================================================================
 * Specification Reference: M9-003 / API-001 / IAM-002
 * Route: POST /api/ai/content/[id]/approve
 * Delegation: 100% to aiService.content (0% Prisma / 0% Repositories)
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { aiService } from "@/services/ai.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "ai:approve")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;
    const result = await aiService.content.approveGeneratedContent(
      session.companyId,
      session.userId,
      resolvedParams.id
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
