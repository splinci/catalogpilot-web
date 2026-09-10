/**
 * ============================================================================
 * Atlas Commerce OS — Customer REST API Endpoint Handler
 * ============================================================================
 * Specification Reference: CRM-003 / API-001 / IAM-002
 * Route: GET /api/customers, POST /api/customers
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { customerRepository } from "@/repositories/customer.repository";
import { customerService } from "@/services/crm/customer.service";
import { CreateCustomerSchema, CustomerQuerySchema } from "@/types/crm.dto";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "customers:read")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const parsedQuery = CustomerQuerySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search") || undefined,
      creditHold: searchParams.get("creditHold") ? searchParams.get("creditHold") === "true" : undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { success: false, error: "Validation Error", details: parsedQuery.error.format() },
        { status: 422 }
      );
    }

    const result = await customerRepository.findMany(session.companyId, parsedQuery.data);

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
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

    if (!authorizationService.hasPermission(session.role, "customers:write")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CreateCustomerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation Error", details: parsed.error.format() },
        { status: 422 }
      );
    }

    const customer = await customerService.createCustomer(session, parsed.data);

    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}