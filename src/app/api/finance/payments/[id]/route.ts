/**
 * ============================================================================
 * Atlas Commerce OS — Payment Detail REST API Handler
 * ============================================================================
 * Specification Reference: FIN-004 / API-001 / IAM-002
 * Route: GET /api/finance/payments/[id]
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "finance:read")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const payment = await prisma.payment.findFirst({
      where: {
        id,
        companyId: session.companyId,
        deletedAt: null,
      },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: payment });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
