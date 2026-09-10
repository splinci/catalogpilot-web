/**
 * ============================================================================
 * Atlas Commerce OS — Payment Allocation REST API Handler
 * ============================================================================
 * Specification Reference: FIN-004 / API-001 / IAM-002
 * Route: POST /api/finance/payments/[id]/allocate
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { paymentService } from "@/services/finance/payment.service";
import { RecordPaymentSchema } from "@/types/finance.dto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "finance:write")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = RecordPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation Error", details: parsed.error.format() },
        { status: 422 }
      );
    }

    const allocated = await paymentService.recordPayment(session, parsed.data);

    return NextResponse.json({ success: true, data: allocated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
