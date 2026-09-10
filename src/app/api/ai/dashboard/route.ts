/**
 * ============================================================================
 * Ondrio Commerce OS — AI Dashboard REST API Endpoint Handler
 * ============================================================================
 * Specification Reference: M9-003 / API-001 / IAM-002
 * Route: GET /api/ai/dashboard
 * Delegation: 100% to aiService.analytics (0% Prisma / 0% Repositories)
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { aiService } from "@/services/ai.service";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (
      !authorizationService.hasPermission(session.role, "ai:read") &&
      !authorizationService.hasPermission(session.role, "reports:read")
    ) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const dashboard = await aiService.analytics.getDashboard(session.companyId);

    return NextResponse.json({ success: true, data: dashboard });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
