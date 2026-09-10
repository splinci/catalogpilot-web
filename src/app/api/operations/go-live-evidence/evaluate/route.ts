import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { operationsService } from "@/services/operations.service";

export async function POST() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "operations:manage")) {
      return NextResponse.json({ error: "Forbidden: Operations manage permission required" }, { status: 403 });
    }

    const companyId = session.companyId || undefined;
    const gate30Evidence = await operationsService.goLiveEvidence.getGate30Evidence(companyId);
    const gate30Evaluation = await operationsService.goLiveEvidence.getGate30Evaluation(companyId);

    return NextResponse.json({
      message: "Current observation window evaluated successfully",
      evidence: gate30Evidence,
      evaluation: gate30Evaluation,
    });
  } catch (error: any) {
    console.error("POST /api/operations/go-live-evidence/evaluate error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to evaluate observation window" },
      { status: 500 }
    );
  }
}
