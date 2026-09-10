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

    const metrics = await procurementAnalyticsService.getProcurementMetrics(session);
    return NextResponse.json({ success: true, data: metrics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch procurement dashboard metrics" }, { status: 400 });
  }
}
