/**
 * ============================================================================
 * Atlas Commerce OS — Customer Activity & Details REST API Handler
 * ============================================================================
 * Specification Reference: CRM-003 / API-001 / IAM-002
 * Route: GET /api/customers/[id]/details
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { customerActivityService } from "@/services/crm/customer-activity.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "customers:read")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const timeline = await customerActivityService.getCustomerTimeline(session.companyId, id);

    return NextResponse.json({ success: true, data: { timeline } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}