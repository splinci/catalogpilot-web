import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { prisma } from "@/lib/prisma";
import { AuditAction, Role } from "@prisma/client";
import { SMTPEmailProvider } from "@/services/providers/email-provider.interface";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Session Authentication
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Session missing or expired" },
        { status: 401 }
      );
    }

    // 2. Platform Admin Authorization
    const isPlatformAdmin = authorizationService.isPlatformAdmin(session);
    if (!isPlatformAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only Splinci Platform Administrators can resend merchant invitations." },
        { status: 403 }
      );
    }

    const { id } = await params;

    // 3. Resolve Target Merchant & Primary Administrator
    const company = await prisma.company.findFirst({
      where: { id, deletedAt: null },
      include: {
        users: {
          where: { role: Role.ADMIN },
          orderBy: { createdAt: "asc" },
          take: 1,
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Merchant not found" },
        { status: 404 }
      );
    }

    // 4. Lifecycle Eligibility Safeguards
    if (!company.isActive) {
      return NextResponse.json(
        { success: false, error: "Bad Request: Cannot resend invitation for an inactive merchant company. Please set merchant to Active first." },
        { status: 400 }
      );
    }

    const primaryAdmin = company.users[0];
    if (!primaryAdmin) {
      return NextResponse.json(
        { success: false, error: "Not Found: No primary administrator account assigned to this merchant." },
        { status: 404 }
      );
    }

    if (primaryAdmin.isActive) {
      return NextResponse.json(
        { success: false, error: "Bad Request: Target primary administrator account is already active. Resend invitation is prohibited for active accounts." },
        { status: 400 }
      );
    }

    // 5. Deterministic Resend Sequencing Calculation
    const existingAuditLogs = await prisma.auditLog.findMany({
      where: {
        companyId: company.id,
        action: AuditAction.USER_UPDATED,
      },
      select: { details: true },
    });

    const previousResends = existingAuditLogs.filter((log) => {
      const details = log.details as any;
      return details && details.type === "INVITATION_RESENT";
    }).length;

    const resendCount = previousResends + 1;
    const sequenceTag = `RESEND-${resendCount}`;

    // 6. Token Generation & Invalidation Transaction
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours

    await prisma.$transaction(async (tx) => {
      // Invalidate all prior sessions for the administrator
      await tx.session.deleteMany({
        where: { userId: primaryAdmin.id },
      });

      // Create new single-use session
      await tx.session.create({
        data: {
          userId: primaryAdmin.id,
          tokenHash,
          expiresAt,
        },
      });

      // Create Audit Log entry
      await tx.auditLog.create({
        data: {
          companyId: company.id,
          userId: session.userId,
          action: AuditAction.USER_UPDATED,
          entityName: "User",
          entityId: primaryAdmin.id,
          details: {
            type: "INVITATION_RESENT",
            resendCount,
            sequenceTag,
            recipientEmail: primaryAdmin.email,
            resentByEmail: session.email,
          },
        },
      });
    });

    // 7. Fail-Closed SMTP Email Transmission
    const emailProvider = new SMTPEmailProvider();
    const activationUrl = `https://app.splinci.com/login?mode=activate&token=${rawToken}`;

    const emailSubject = `${sequenceTag}: Activate your Splinci Commerce OS account — ${company.displayName}`;
    const emailBodyText = `Hello ${primaryAdmin.firstName},

This is a resend invitation (${sequenceTag}) to activate your Primary Administrator account for ${company.displayName} on Splinci Commerce OS.

Company: ${company.displayName} (${company.code})
Role: Primary Administrator (${primaryAdmin.role})
Sequence: ${sequenceTag}

Please set your administrator password and activate your account by clicking the secure link below:

${activationUrl}

Note: Any previously issued activation link for this account has been invalidated. This new link is single-use and will expire in 24 hours. No temporary password has been set.

If you did not request this invitation, please contact info@splinci.com.

Regards,
Splinci Commerce OS Enterprise Platform Operations`;

    let invitationStatus: "SENT" | "INVITATION_FAILED" = "SENT";
    let deliveryError: string | undefined;

    try {
      const emailResult = await emailProvider.sendEmail({
        companyId: company.id,
        to: primaryAdmin.email,
        subject: emailSubject,
        bodyText: emailBodyText,
      });

      if (!emailResult.success || !emailResult.messageId || emailResult.messageId.includes("MOCK")) {
        invitationStatus = "INVITATION_FAILED";
        deliveryError = emailResult.errorMessage || "Live SMTP provider is unavailable or operating in sandbox mode.";
      }
    } catch (err: any) {
      invitationStatus = "INVITATION_FAILED";
      deliveryError = err?.message || "Live SMTP email delivery failed.";
    }

    if (invitationStatus === "INVITATION_FAILED") {
      return NextResponse.json(
        {
          success: false,
          error: `Service Unavailable: Invitation resend (${sequenceTag}) failed to transmit via SMTP. ${deliveryError || ""}`,
        },
        { status: 533 }
      );
    }

    // 8. Return Sanitized Success Metadata (0 raw tokens, 0 hashes, 0 credentials returned)
    return NextResponse.json({
      success: true,
      message: `Invitation resent successfully (${sequenceTag}).`,
      data: {
        companyId: company.id,
        companyName: company.displayName,
        adminEmail: primaryAdmin.email,
        resendCount,
        sequenceTag,
        invitationStatus: "SENT",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
