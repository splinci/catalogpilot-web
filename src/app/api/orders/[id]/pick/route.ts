/**
 * ============================================================================
 * Atlas Commerce OS — Order Picking REST API Handler
 * ============================================================================
 * Specification Reference: ORD-004 / API-001 / IAM-002
 * Route: POST /api/orders/[id]/pick
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { pickListEngineService } from "@/services/orders/picklist-engine.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "orders:write")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const pickList = await pickListEngineService.generatePickList(session, id);

    return NextResponse.json({ success: true, data: pickList });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
