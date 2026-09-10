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
    const gate30Evidence = await operationsService.goLiveEvidence.getGate30Evidence(companyId);
    const gate30Evaluation = await operationsService.goLiveEvidence.getGate30Evaluation(companyId);

    return NextResponse.json({
      evidence: gate30Evidence,
      evaluation: gate30Evaluation,
    });
  } catch (error: any) {
    console.error("GET /api/operations/go-live-evidence/gate-30 error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve GATE 30 evidence evaluation" },
      { status: 500 }
    );
  }
}
