/**
 * ============================================================================
 * Ondrio Commerce OS — Finance Report REST API Endpoint Handler
 * ============================================================================
 * Specification Reference: M10-003 / API-001 / IAM-002
 * Route: GET /api/reporting/finance
 * Delegation: 100% to financeReportService (0% Prisma / 0% Repositories)
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { financeReportService } from "@/services/reporting.service";
import { FinanceReportQuerySchema } from "@/types/reporting.dto";

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
      status: searchParams.get("status") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const parseResult = FinanceReportQuerySchema.safeParse(rawQuery);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity - Invalid query parameters", details: parseResult.error.format() },
        { status: 422 }
      );
    }

    const [revenue, receivables, collections, invoices, payments, profitability] = await Promise.all([
      financeReportService.revenueDashboard(session, parseResult.data),
      financeReportService.receivablesDashboard(session, parseResult.data),
      financeReportService.collectionsDashboard(session, parseResult.data),
      financeReportService.invoiceKPIs(session, parseResult.data),
      financeReportService.paymentKPIs(session, parseResult.data),
      financeReportService.profitabilityMetrics(session, parseResult.data),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        revenue,
        receivables,
        collections,
        invoices,
        payments,
        profitability,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
