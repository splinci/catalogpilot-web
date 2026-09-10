import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { operationsService } from "@/services/operations.service";
import { handleApiError } from "@/lib/api/handleApiError";
import { metricsCollector } from "@/lib/observability/metrics";
import { getActiveAlerts } from "@/lib/observability/alerting";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const securityMetricsData = await operationsService.metrics.getSecurityEventMetrics(session.companyId);
    const sli = metricsCollector.getSLIMetrics();
    const alerts = getActiveAlerts().filter((a) => a.severity === "SEV-1" || a.source === "SECURITY_MONITOR");

    return NextResponse.json({
      success: true,
      data: securityMetricsData,
      securityMetrics: {
        authFailuresCount: sli.authFailures,
        rateLimitHitsCount: sli.rateLimitHits,
        crossTenantBlocksCount: sli.crossTenantBlocks,
      },
      securityAlertsCount: alerts.length,
      alerts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
