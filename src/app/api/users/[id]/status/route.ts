import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuditAction } from "@prisma/client";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if ((session.role as string) !== "ADMIN" && (session.role as string) !== "PLATFORM_ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { isActive } = body;

    // Self-lockout check
    if (id === session.userId && !isActive) {
      return NextResponse.json({ success: false, error: "Self-lockout prevented: You cannot disable your own active session" }, { status: 400 });
    }

    // Verify tenant scoping
    const targetUser = await prisma.user.findFirst({
      where: { id, companyId: session.companyId },
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, error: "User not found or belongs to another company" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
    });

    await prisma.auditLog.create({
      data: {
        companyId: session.companyId,
        userId: session.userId,
        action: AuditAction.USER_UPDATED,
        entityName: "User",
        entityId: id,
        details: JSON.stringify({ email: targetUser.email, isActive }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to update status" }, { status: 500 });
  }
}
