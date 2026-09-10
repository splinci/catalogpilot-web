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

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if ((session.role as string) !== "ADMIN" && (session.role as string) !== "PLATFORM_ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const { id } = await params;

    // Self-lockout check
    if (id === session.userId) {
      return NextResponse.json({ success: false, error: "Self-lockout prevented: You cannot remove your own active user account" }, { status: 400 });
    }

    // Verify tenant scoping
    const targetUser = await prisma.user.findFirst({
      where: { id, companyId: session.companyId },
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, error: "User not found or belongs to another company" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        companyId: session.companyId,
        userId: session.userId,
        action: AuditAction.USER_UPDATED,
        entityName: "User",
        entityId: id,
        details: JSON.stringify({ email: targetUser.email, action: "DELETED" }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to remove user" }, { status: 500 });
  }
}