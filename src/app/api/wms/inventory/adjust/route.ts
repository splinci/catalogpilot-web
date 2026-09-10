import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { inventoryService } from "@/services/inventory.service";
import { StockAdjustmentSchema } from "@/types/inventory.dto";
import { authorizationService } from "@/services/authorization.service";

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "inventory:adjust")) {
      return NextResponse.json({ success: false, error: "Forbidden: Missing inventory:adjust permission" }, { status: 403 });
    }

    const body = await request.json();
    const data = StockAdjustmentSchema.parse(body);

    const updatedItem = await inventoryService.adjustStock(session, data);
    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to adjust stock" }, { status: 400 });
  }
}
