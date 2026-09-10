import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { purchasingService } from "@/services/purchasing.service";
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
    const po = await purchasingService.getPurchaseOrderById(session, id);
    return NextResponse.json({ success: true, data: po });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Purchase order not found" }, { status: 404 });
  }
}
