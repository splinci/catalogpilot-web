import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { operationsService } from "@/services/operations.service";
import { handleApiError } from "@/lib/api/handleApiError";
import { metricsCollector } from "@/lib/observability/metrics";
import { evaluateSLOAlerts, getActiveAlerts } from "@/lib/observability/alerting";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = await operationsService.metrics.getOperationalKPIs(session.companyId);
    const sli = metricsCollector.getSLIMetrics();
    evaluateSLOAlerts(sli);
    const alerts = getActiveAlerts();

    return NextResponse.json({
      success: true,
      data,
      sli: {
        targetAvailabilityPercent: 99.9,
        currentAvailabilityPercent: sli.apiAvailabilityPercent,
        avgLatencyMs: sli.avgLatencyMs,
        targetAvgLatencyMs: 200,
        errorRatePercent: sli.errorRatePercent,
        errorBudgetRemainingPercent: sli.errorBudgetRemainingPercent,
      },
      alertsCount: alerts.length,
      alerts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
