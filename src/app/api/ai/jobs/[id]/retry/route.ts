/**
 * ============================================================================
 * Ondrio Commerce OS — AI Job Retry REST API Endpoint Handler
 * ============================================================================
 * Specification Reference: M9-003 / API-001 / IAM-002
 * Route: POST /api/ai/jobs/[id]/retry
 * Delegation: 100% to aiService.job (0% Prisma / 0% Repositories)
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

    if (!authorizationService.hasPermission(session.role, "ai:write")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;
    const job = await aiService.job.retryJob(session.companyId, session.userId, resolvedParams.id);

    return NextResponse.json({ success: true, data: job });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
