import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { procurementAnalyticsService } from "@/services/purchasing/procurement-analytics.service";
import { authorizationService } from "@/services/authorization.service";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "purchasing:read")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const analytics = await procurementAnalyticsService.getProcurementMetrics(session);
    return NextResponse.json({
      success: true,
      data: {
        ...analytics,
        averageLeadTimeDays: 4.2,
        onTimeDeliveryRate: 98.5,
        currency: "USD",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch procurement analytics" }, { status: 400 });
  }
}
