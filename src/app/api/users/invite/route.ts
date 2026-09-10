import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuditAction } from "@prisma/client";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized: Session missing or expired" }, { status: 401 });
    }

    if ((session.role as string) !== "ADMIN" && (session.role as string) !== "PLATFORM_ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    // Rate Limiting Protection (Max 10 invites per minute per tenant)
    const rateLimit = checkRateLimit(`invite_${session.companyId}`, 10, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded: Too many user invitation requests. Try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { firstName, lastName, email, role } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Valid email address is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: "A user with this email address already exists" }, { status: 409 });
    }

    // Default temp password for invite
    const passwordHash = await hashPassword("AtlasWelcome2026!");

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
        companyId: session.companyId,
        role: role === "ADMIN" ? "ADMIN" : "CATALOG_EDITOR",
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        companyId: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.companyId,
        userId: session.userId,
        action: AuditAction.USER_CREATED,
        entityName: "User",
        entityId: newUser.id,
        details: JSON.stringify({ email: newUser.email, role: newUser.role }),
      },
    });

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to send user invitation" }, { status: 500 });
  }
}
