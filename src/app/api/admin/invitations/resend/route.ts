/**
 * ============================================================================
 * Splinci Commerce OS — Secure Server-Side Administrator Invitation Resend API
 * ============================================================================
 * Specification Reference: REAL-MERCHANT-001 / PHASE-1H / IAM-002
 * Route: POST /api/admin/invitations/resend
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authorizationService } from "@/services/authorization.service";
import { SMTPEmailProvider } from "@/services/providers/email-provider.interface";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 1. Session Authentication
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2. Admin RBAC Authorization
    if (session.role !== "ADMIN" && !authorizationService.hasPermission(session.role, "users:manage")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // 3. Request Payload Parsing
    const body = await req.json().catch(() => ({}));
    const targetUserId = body.userId;

    if (!targetUserId || typeof targetUserId !== "string") {
      return NextResponse.json({ success: false, error: "Bad Request: Missing required parameter 'userId'." }, { status: 400 });
    }

    // 4. Target User & Tenant Isolation Resolution
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { company: true },
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, error: "Not Found: Target user record does not exist." }, { status: 404 });
    }

    // Enforce Tenant Isolation (Caller must belong to target user's company or platform super-admin context)
    const isPlatformAdmin = session.companyCode === "SPLINCI" || session.companyId === "cmp_splinci_01" || session.companyCode === "ATLAS";
    if (!isPlatformAdmin && targetUser.companyId !== session.companyId) {
      return NextResponse.json({ success: false, error: "Forbidden: Cross-tenant invitation management is prohibited." }, { status: 403 });
    }

    // 5. User Activation Eligibility Verification
    if (targetUser.isActive) {
      return NextResponse.json({ success: false, error: "Bad Request: Target user account is already active." }, { status: 400 });
    }

    // 6. Active Activation Token Session Resolution
    const activeSession = await prisma.session.findFirst({
      where: {
        userId: targetUser.id,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!activeSession) {
      return NextResponse.json(
        { success: false, error: "Bad Request: No valid active activation token session exists for user. A new activation workflow is required." },
        { status: 400 }
      );
    }

    // 7. Server-Side SMTP Provider Configuration Verification (Fail-Closed Policy)
    const hasSmtpPass = Boolean(process.env.SMTP_PASS || process.env.SMTP_PASSWORD);
    if (!hasSmtpPass) {
      return NextResponse.json(
        { success: false, error: "Service Unavailable: Production email provider is not configured." },
        { status: 503 }
      );
    }

    // 8. Execute Server-Side SMTPEmailProvider Transmission
    const emailProvider = new SMTPEmailProvider();

    // Construct secure single-use activation URL referencing existing token session secret
    const activationTokenSecret = activeSession.tokenHash || activeSession.id;
    const activationUrl = `https://app.splinci.com/login?mode=activate&token=${activationTokenSecret}`;

    const emailBodyText = `Hello ${targetUser.firstName},

You have been invited to access Splinci Commerce OS for ${targetUser.company.displayName}.

${targetUser.firstName} ${targetUser.lastName} has been assigned the Primary Administrator (${targetUser.role}) role.
Your account is currently awaiting activation.

Use the secure single-use activation link below to create your password and activate your account:

${activationUrl}

This activation link is single-use and expires after 24 hours. No temporary password has been generated.

If you did not expect this invitation, please contact info@splinci.com.

Regards,
Splinci Commerce OS Enterprise Administration`;

    const emailResult = await emailProvider.sendEmail({
      companyId: targetUser.companyId,
      to: targetUser.email,
      subject: `Activate Your Splinci Commerce OS Administrator Account — ${targetUser.company.displayName}`,
      bodyText: emailBodyText,
    });

    // Enforce Fail-Closed Validation: Reject any mock provider, sandbox fallback, or transmission failure
    if (!emailResult.success || !emailResult.messageId || emailResult.messageId.includes("MOCK")) {
      return NextResponse.json(
        { success: false, error: "Service Unavailable: Live SMTP provider is unavailable or operating in sandbox mode." },
        { status: 503 }
      );
    }

    // 9. Return Sanitized API Success Metadata (0 secrets, 0 tokens, 0 credentials returned)
    return NextResponse.json(
      {
        success: true,
        message: "Invitation email submitted successfully.",
        data: {
          recipientEmail: targetUser.email,
          status: emailResult.status,
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
