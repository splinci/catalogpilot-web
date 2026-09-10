/**
 * ============================================================================
 * Splinci Commerce OS — Secure Administrator Account Activation API
 * ============================================================================
 * Specification Reference: REAL-MERCHANT-001 / PHASE-2B / IAM-003
 * Route: POST /api/auth/activate
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { auditService } from "@/services/audit.service";
import { AuditAction } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, password } = body;

    // 1. Parameter Validation
    if (!token || typeof token !== "string" || !password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Bad Request: Missing required parameters 'token' and 'password'." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Bad Request: Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // 2. Compute Token SHA-256 Hash
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // 3. Resolve Activation Session & Inactive User
    const session = await prisma.session.findFirst({
      where: {
        OR: [
          { tokenHash: tokenHash },
          { tokenHash: token },
          { id: token },
        ],
        expiresAt: { gt: new Date() },
      },
      include: { user: { include: { company: true } } },
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired activation token." },
        { status: 400 }
      );
    }

    if (session.user.isActive) {
      return NextResponse.json(
        { success: false, error: "Account is already active. Please proceed to login." },
        { status: 400 }
      );
    }

    // 4. Hash Password using Argon2id
    const passwordHash = await hashPassword(password);

    // 5. Execute Atomic Activation Transaction
    await prisma.$transaction(async (tx) => {
      // Set User ACTIVE and assign passwordHash
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          passwordHash,
          isActive: true,
        },
      });

      // Consume/Delete the single-use activation session
      await tx.session.delete({
        where: { id: session.id },
      });
    });

    // 6. Record Audit Log
    await auditService.log({
      companyId: session.user.companyId,
      userId: session.user.id,
      action: AuditAction.USER_UPDATED,
      entityName: "User",
      entityId: session.user.id,
      details: { action: "ADMINISTRATOR_ACCOUNT_ACTIVATED", recipientEmail: session.user.email },
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    // 7. Return Sanitized API Success Response (Zero credentials, zero tokens returned)
    return NextResponse.json(
      {
        success: true,
        message: "Administrator account activated successfully. Please log in with your credentials.",
        data: {
          recipientEmail: session.user.email,
          companyCode: session.user.company.code,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
