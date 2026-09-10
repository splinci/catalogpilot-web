import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { goodsReceiptRepository } from "@/repositories/goods-receipt.repository";
import { authorizationService } from "@/services/authorization.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "purchasing:read")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const receipt = await goodsReceiptRepository.findById(session.companyId, id);
    if (!receipt) {
      return NextResponse.json({ success: false, error: "Goods Receipt not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: receipt });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch Goods Receipt" }, { status: 400 });
  }
}
