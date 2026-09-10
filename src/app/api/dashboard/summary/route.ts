import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { dashboardService } from "@/services/reporting/dashboard.service";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = await dashboardService.getExecutiveDashboard(session);

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: data.summary.totalRevenue || 0,
        totalOrders: data.summary.totalOrdersCount || 0,
        activeCustomers: data.summary.activeCustomersCount || 0,
        totalProducts: data.summary.activeProductsCount || 0,
        lowStock: 0,
        pendingPOs: 0,
        receivedPOs: 0,
        shipmentsSent: 0,
        warehousesCount: 0,
        aiQueuedTasks: data.summary.aiJobsExecuted || 0,
        publishedProducts: data.summary.activeProductsCount || 0,
        inventoryOverview: {
          inStock: 0,
          lowStock: 0,
          outOfStock: 0,
        },
        recentProducts: [],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load dashboard summary." },
      { status: 500 }
    );
  }
}