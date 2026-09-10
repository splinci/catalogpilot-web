import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { inventoryService } from "@/services/inventory.service";
import { StockTransferSchema } from "@/types/inventory.dto";
import { authorizationService } from "@/services/authorization.service";

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "inventory:write")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const data = StockTransferSchema.parse(body);

    const result = await inventoryService.transferStock(session, data);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to transfer stock" }, { status: 400 });
  }
}
