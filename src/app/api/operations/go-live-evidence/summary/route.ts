import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { operationsService } from "@/services/operations.service";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "operations:read")) {
      return NextResponse.json({ error: "Forbidden: Operations read permission required" }, { status: 403 });
    }

    const companyId = session.companyId || undefined;
    const dashboard = await operationsService.goLiveEvidence.getDashboardPayload(companyId);

    return NextResponse.json(dashboard);
  } catch (error: any) {
    console.error("GET /api/operations/go-live-evidence/summary error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve evidence summary dashboard" },
      { status: 500 }
    );
  }
}
