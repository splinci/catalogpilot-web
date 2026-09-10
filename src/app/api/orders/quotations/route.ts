/**
 * ============================================================================
 * Atlas Commerce OS — Sales Quotations REST API Handler
 * ============================================================================
 * Specification Reference: ORD-004 / API-001 / IAM-002
 * Route: GET /api/orders/quotations, POST /api/orders/quotations
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { salesQuotationRepository } from "@/repositories/sales-quotation.repository";
import { z } from "zod";

const CreateQuotationSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  validUntil: z.string().datetime().or(z.string().transform((val) => new Date(val).toISOString())),
  totalAmount: z.number().nonnegative(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "orders:read")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const result = await salesQuotationRepository.findMany(session.companyId, page, limit);

    return NextResponse.json({ success: true, data: result.items, pagination: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "orders:write")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CreateQuotationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation Error", details: parsed.error.format() },
        { status: 422 }
      );
    }

    const quotation = await salesQuotationRepository.createQuotation(
      session.companyId,
      parsed.data.customerId,
      new Date(parsed.data.validUntil),
      parsed.data.totalAmount
    );

    return NextResponse.json({ success: true, data: quotation }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
