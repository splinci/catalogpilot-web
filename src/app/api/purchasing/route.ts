import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { purchasingService } from "@/services/purchasing.service";
import { CreatePurchaseOrderSchema, PurchaseOrderQuerySchema } from "@/types/purchasing.dto";

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = PurchaseOrderQuerySchema.parse(Object.fromEntries(searchParams));

    const data = await purchasingService.listPurchaseOrders(session, query);
    return NextResponse.json({ success: true, data });
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

    const body = await request.json();
    const validatedData = CreatePurchaseOrderSchema.parse(body);

    const data = await purchasingService.createPurchaseOrder(session, validatedData);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to create purchase order" }, { status: 400 });
  }
}
