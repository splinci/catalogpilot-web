/**
 * ============================================================================
 * Splinci Commerce OS — Operational Notifications REST API
 * ============================================================================
 * Specification Reference: M12-003 / API-001 / IAM-002
 * Route: GET /api/operations/notifications, POST /api/operations/notifications
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../lib/auth";
import { authorizationService } from "../../../../services/authorization.service";
import { operationsService } from "../../../../services/operations.service";
import { CreateNotificationSchema, NotificationQuerySchema } from "../../../../types/operations.dto";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "operations:read")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const parsedQuery = NotificationQuerySchema.safeParse({
      companyId: session.companyId,
      userId: session.userId,
      isRead: searchParams.get("isRead") !== null ? searchParams.get("isRead") === "true" : undefined,
      limit: searchParams.get("limit") || "50",
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity", details: parsedQuery.error.format() },
        { status: 422 }
      );
    }

    const notifications = await operationsService.notifications.listNotifications(parsedQuery.data);
    return NextResponse.json({ success: true, data: notifications });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "operations:notifications")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CreateNotificationSchema.safeParse({
      ...body,
      companyId: session.companyId, // Inject companyId from server session
      userId: body.userId || session.userId, // Default recipient to caller if not specified
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Unprocessable Entity", details: parsed.error.format() },
        { status: 422 }
      );
    }

    const notification = await operationsService.notifications.createNotification(parsed.data);
    return NextResponse.json({ success: true, data: notification }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 400 }
    );
  }
}
