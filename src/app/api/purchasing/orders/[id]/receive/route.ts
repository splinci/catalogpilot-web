import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { goodsReceiptService } from "@/services/goods-receipt.service";
import { ReceiveGoodsSchema } from "@/types/purchasing.dto";
import { authorizationService } from "@/services/authorization.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "purchasing:write")) {
      return NextResponse.json({ success: false, error: "Forbidden: Missing purchasing:write permission" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const input = ReceiveGoodsSchema.parse(body);

    const receipt = await goodsReceiptService.receiveGoods(session, id, input);
    return NextResponse.json({ success: true, data: receipt }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to process goods receipt" }, { status: 400 });
  }
}
