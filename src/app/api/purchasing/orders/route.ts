import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { purchasingService } from "@/services/purchasing.service";
import { CreatePurchaseOrderSchema, PurchaseOrderQuerySchema } from "@/types/purchasing.dto";
import { authorizationService } from "@/services/authorization.service";

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "purchasing:read")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = PurchaseOrderQuerySchema.parse(Object.fromEntries(searchParams));

    const [orders, stats] = await Promise.all([
      purchasingService.listPurchaseOrders(session, query),
      purchasingService.getProcurementStats(session),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...orders,
        stats,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch purchase orders" }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "purchasing:write")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const data = CreatePurchaseOrderSchema.parse(body);

    const po = await purchasingService.createPurchaseOrder(session, data);
    return NextResponse.json({ success: true, data: po }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to create purchase order" }, { status: 400 });
  }
}
