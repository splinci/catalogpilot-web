import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { productService } from "@/services/product.service";
import { ProductStatusTransitionSchema } from "@/types/pim.dto";
import { authorizationService } from "@/services/authorization.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "products:publish")) {
      return NextResponse.json({ success: false, error: "Forbidden: Missing products:publish permission" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, reason } = ProductStatusTransitionSchema.parse(body);

    const updatedProduct = await productService.transitionStatus(session, id, status, reason);
    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to update product status" }, { status: 400 });
  }
}
