/**
 * ============================================================================
 * Ondrio Commerce OS — Sales Report REST API Endpoint Handler
 * ============================================================================
 * Specification Reference: M10-003 / API-001 / IAM-002
 * Route: GET /api/reporting/sales
 * Delegation: 100% to salesReportService (0% Prisma / 0% Repositories)
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { salesReportService } from "@/services/reporting.service";
import { SalesReportQuerySchema } from "@/types/reporting.dto";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "reports:read")) {
      return NextResponse.json({ success: false, error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const rawQuery = {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      customerId: searchParams.get("customerId") || undefined,
      productId: searchParams.get("productId") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      salespersonId: searchParams.get("salespersonId") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const parseResult = SalesReportQuerySchema.safeParse(rawQuery);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity - Invalid query parameters", details: parseResult.error.format() },
        { status: 422 }
      );
    }

    const [performance, trend, customers, products, categories, topCustomers, topProducts] = await Promise.all([
      salesReportService.salesPerformance(session, parseResult.data),
      salesReportService.salesTrend(session, parseResult.data),
      salesReportService.customerSales(session, parseResult.data),
      salesReportService.productSales(session, parseResult.data),
      salesReportService.categorySales(session, parseResult.data),
      salesReportService.topCustomers(session, 5),
      salesReportService.topProducts(session, 5),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        performance,
        trend,
        customers,
        products,
        categories,
        topCustomers,
        topProducts,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
