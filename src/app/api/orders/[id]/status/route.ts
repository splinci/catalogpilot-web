/**
 * ============================================================================
 * Atlas Commerce OS — Order Status Transition REST API Handler
 * ============================================================================
 * Specification Reference: ORD-004 / API-001 / IAM-002
 * Route: PATCH /api/orders/[id]/status
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { orderService } from "@/services/orders/order.service";
import { OrderStatusTransitionSchema } from "@/types/order.dto";
import { OrderStatus } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "orders:approve")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = OrderStatusTransitionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation Error", details: parsed.error.format() },
        { status: 422 }
      );
    }

    const { status, reason } = parsed.data;
    let updated;

    if (status === OrderStatus.CONFIRMED) {
      updated = await orderService.confirmOrder(session, id);
    } else if (status === OrderStatus.CANCELLED) {
      updated = await orderService.cancelOrder(session, id, reason);
    } else if (status === OrderStatus.COMPLETED) {
      updated = await orderService.closeOrder(session, id);
    } else {
      return NextResponse.json(
        { success: false, error: `Direct status transition to '${status}' is not supported via status patch` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}