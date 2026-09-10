import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { inventoryService } from "@/services/inventory.service";
import { InventoryQuerySchema } from "@/types/inventory.dto";
import { authorizationService } from "@/services/authorization.service";

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "inventory:read")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = InventoryQuerySchema.parse(Object.fromEntries(searchParams));

    const [inventoryData, stats] = await Promise.all([
      inventoryService.listInventory(session, query),
      inventoryService.getInventoryStats(session),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...inventoryData,
        stats,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch inventory" }, { status: 400 });
  }
}
