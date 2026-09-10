/**
 * ============================================================================
 * Atlas Commerce OS — Order Stock Reservation REST API Handler
 * ============================================================================
 * Specification Reference: ORD-004 / API-001 / IAM-002
 * Route: POST /api/orders/[id]/reserve
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { fulfillmentService } from "@/services/orders/fulfillment.service";
import { z } from "zod";

const ReserveSchema = z.object({
  warehouseId: z.string().min(1, "Warehouse ID is required"),
});

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
    const body = await req.json().catch(() => ({}));
    const parsed = ReserveSchema.safeParse(body);

    const warehouseId = parsed.success ? parsed.data.warehouseId : "WH-MAIN";
    const updated = await fulfillmentService.reserveInventory(session, id, warehouseId);

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
