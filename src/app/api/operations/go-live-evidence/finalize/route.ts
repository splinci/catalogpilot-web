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
      return NextResponse.json({ error: "Forbidden: Operations manage permission required for evidence finalization" }, { status: 403 });
    }

    const companyId = session.companyId || undefined;
    const operatorId = session.userId;
    const decision = await operationsService.goLiveEvidence.finalizeEvidencePackage(companyId, operatorId);

    return NextResponse.json({
      message: "Evidence package finalized for governance review",
      decision,
    });
  } catch (error: any) {
    console.error("POST /api/operations/go-live-evidence/finalize error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to finalize evidence package" },
      { status: 500 }
    );
  }
}
