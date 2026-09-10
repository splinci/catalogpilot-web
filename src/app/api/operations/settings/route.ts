/**
 * ============================================================================
 * Splinci Commerce OS — System Settings List & Upsert REST API
 * ============================================================================
 * Specification Reference: M12-003 / API-001 / IAM-002
 * Route: GET /api/operations/settings, PUT /api/operations/settings
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../lib/auth";
import { authorizationService } from "../../../../services/authorization.service";
import { operationsService } from "../../../../services/operations.service";
import { UpsertSystemSettingSchema } from "../../../../types/operations.dto";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "operations:settings")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const settings = await operationsService.settings.listSettings(session.companyId);
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "operations:settings")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = UpsertSystemSettingSchema.safeParse({
      ...body,
      companyId: session.companyId, // Force companyId from authenticated session context
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity", details: parsed.error.format() },
        { status: 422 }
      );
    }

    const setting = await operationsService.settings.upsertSetting(parsed.data, session.userId);
    return NextResponse.json({ success: true, data: setting });
  } catch (error: any) {
    const isValidation = error.message?.includes("Invalid") || error.message?.includes("protected");
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update setting" },
      { status: isValidation ? 422 : 400 }
    );
  }
}
