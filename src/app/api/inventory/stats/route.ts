import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { productService } from "@/domains/inventory/services/product.service";
import { handleApiError } from "@/lib/api/handleApiError";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const stats = await productService.getInventoryStats(session.companyId);
    return NextResponse.json(stats);
  } catch (error) {
    return handleApiError(error);
  }
}