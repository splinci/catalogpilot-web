/**
 * ============================================================================
 * Ondrio Commerce OS — Inventory Report REST API Endpoint Handler
 * ============================================================================
 * Specification Reference: M10-003 / API-001 / IAM-002
 * Route: GET /api/reporting/inventory
 * Delegation: 100% to inventoryReportService (0% Prisma / 0% Repositories)
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { inventoryReportService } from "@/services/reporting.service";
import { InventoryReportQuerySchema } from "@/types/reporting.dto";

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
      warehouseId: searchParams.get("warehouseId") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const parseResult = InventoryReportQuerySchema.safeParse(rawQuery);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity - Invalid query parameters", details: parseResult.error.format() },
        { status: 422 }
      );
    }

    const [valuation, movement, turnover, warehouses, slowMoving, fastMoving, reorder] = await Promise.all([
      inventoryReportService.inventoryKPIs(session, parseResult.data),
      inventoryReportService.inventoryMovement(session, parseResult.data),
      inventoryReportService.inventoryTurnover(session),
      inventoryReportService.warehousePerformance(session),
      inventoryReportService.slowMovingItems(session, 10),
      inventoryReportService.fastMovingItems(session, 10),
      inventoryReportService.reorderAnalysis(session),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        valuation,
        movement,
        turnover,
        warehouses,
        slowMoving,
        fastMoving,
        reorder,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
