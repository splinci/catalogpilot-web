import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { goodsReceiptRepository } from "@/repositories/goods-receipt.repository";
import { goodsReceiptService } from "@/services/purchasing/goods-receipt.service";
import { ReceiveGoodsSchema } from "@/types/purchasing.dto";
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
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "20");

    const receipts = await goodsReceiptRepository.findMany(session.companyId, page, limit);
    return NextResponse.json({ success: true, data: receipts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch goods receipts" }, { status: 400 });
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
    const { poId, ...receiptData } = body;
    if (!poId) {
      return NextResponse.json({ success: false, error: "Purchase Order ID (poId) is required" }, { status: 400 });
    }

    const input = ReceiveGoodsSchema.parse(receiptData);
    const receipt = await goodsReceiptService.receiveGoods(session, poId, input);

    return NextResponse.json({ success: true, data: receipt }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to process goods receipt" }, { status: 400 });
  }
}
