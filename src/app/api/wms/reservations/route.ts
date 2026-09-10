import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { reservationService } from "@/services/reservation.service";
import { StockReservationSchema } from "@/types/inventory.dto";
import { authorizationService } from "@/services/authorization.service";

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "orders:write")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const data = StockReservationSchema.parse(body);

    const reservations = await reservationService.reserveStockForOrder(session, data);
    return NextResponse.json({ success: true, data: reservations }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "orders:write")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const salesOrderId = searchParams.get("salesOrderId");

    if (!salesOrderId) {
      return NextResponse.json({ success: false, error: "salesOrderId is required" }, { status: 400 });
    }

    const result = await reservationService.releaseOrderReservations(session, salesOrderId);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
