import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { purchasingService } from "@/services/purchasing.service";
import { POStatusTransitionSchema } from "@/types/purchasing.dto";
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

    if (!authorizationService.hasPermission(session.role, "purchasing:approve")) {
      return NextResponse.json({ success: false, error: "Forbidden: Missing purchasing:approve permission" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, reason } = POStatusTransitionSchema.parse(body);

    const updatedPo = await purchasingService.transitionStatus(session, id, status, reason);
    return NextResponse.json({ success: true, data: updatedPo });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to update PO status" }, { status: 400 });
  }
}
