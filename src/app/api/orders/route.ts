/**
 * ============================================================================
 * Atlas Commerce OS — Sales Orders REST API Endpoint Handler
 * ============================================================================
 * Specification Reference: ORD-004 / API-001 / IAM-002
 * Route: GET /api/orders, POST /api/orders
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { salesOrderRepository } from "@/repositories/sales-order.repository";
import { orderService } from "@/services/orders/order.service";
import { CreateSalesOrderSchema, SalesOrderQuerySchema } from "@/types/order.dto";

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
    const parsedQuery = SalesOrderQuerySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      customerId: searchParams.get("customerId") || undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { success: false, error: "Validation Error", details: parsedQuery.error.format() },
        { status: 422 }
      );
    }

    const result = await salesOrderRepository.findMany(session.companyId, parsedQuery.data);

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

    if (!authorizationService.hasPermission(session.role, "orders:write")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CreateSalesOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation Error", details: parsed.error.format() },
        { status: 422 }
      );
    }

    const order = await orderService.createSalesOrder(session, parsed.data);

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}