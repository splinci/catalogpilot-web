/**
 * ============================================================================
 * Atlas Commerce OS — Invoice Issue REST API Handler
 * ============================================================================
 * Specification Reference: FIN-004 / API-001 / IAM-002
 * Route: POST /api/finance/invoices/[id]/issue
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { invoiceService } from "@/services/finance/invoice.service";

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

    const { id } = await params;
    const issued = await invoiceService.issueInvoice(session, id);

    return NextResponse.json({ success: true, data: issued });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
