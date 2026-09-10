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
    const operatorId = session.userId;
    const sample = await operationsService.goLiveEvidence.captureProductionSample(companyId, operatorId);

    return NextResponse.json({
      message: "Genuine production sample captured successfully",
      sample,
    });
  } catch (error: any) {
    console.error("POST /api/operations/go-live-evidence/capture error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to capture production sample" },
      { status: 500 }
    );
  }
}
