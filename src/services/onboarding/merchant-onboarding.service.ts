import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { UserSessionPayload } from "@/types/auth.dto";
import { authorizationService } from "@/services/authorization.service";
import { SMTPEmailProvider } from "@/services/providers/email-provider.interface";

export interface OnboardMerchantInput {
  legalName: string;
  displayName: string;
  companyCode: string;
  taxId?: string;
  businessAddress?: string;
  country: string;
  currency: string;
  timezone: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
}

export interface OnboardMerchantResult {
  success: boolean;
  message: string;
  error?: string;
  data?: {
    companyId: string;
    companyCode: string;
    companyName: string;
    adminUserId: string;
    adminEmail: string;
    invitationStatus: "SENT" | "INVITATION_FAILED" | "PENDING";
  };
}

export class MerchantOnboardingService {
  async onboardMerchant(
    input: OnboardMerchantInput,
    session: UserSessionPayload | null
  ): Promise<OnboardMerchantResult> {
    // 1. Server-Side Platform Admin Authorization Enforcement
    const isPlatformAdmin = authorizationService.isPlatformAdmin(session);
    if (!session || !isPlatformAdmin) {
      return {
        success: false,
        message: "Access Denied",
        error: "Forbidden: Only Splinci Platform Administrators can onboard new merchant tenants.",
      };
    }

    // 2. Input Validation & Normalization
    const legalName = input.legalName?.trim();
    const displayName = input.displayName?.trim();
    const normalizedCode = input.companyCode?.trim().toUpperCase();
    const adminFirstName = input.adminFirstName?.trim();
    const adminLastName = input.adminLastName?.trim();
    const normalizedEmail = input.adminEmail?.trim().toLowerCase();
    const country = input.country?.trim() || "US";
    const currency = input.currency?.trim() || "USD";
    const timezone = input.timezone?.trim() || "America/New_York";

    if (!legalName || !displayName || !normalizedCode || !adminFirstName || !adminLastName || !normalizedEmail) {
      return {
        success: false,
        message: "Validation Error",
        error: "Bad Request: Missing required onboarding parameters.",
      };
    }

    if (!normalizedEmail.includes("@")) {
      return {
        success: false,
        message: "Validation Error",
        error: "Bad Request: Invalid administrator email format.",
      };
    }

    // 3. Uniqueness Checks
    const existingCompany = await prisma.company.findUnique({
      where: { code: normalizedCode },
    });
    if (existingCompany) {
      return {
        success: false,
        message: "Validation Error",
        error: `Bad Request: Company code '${normalizedCode}' already exists.`,
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      return {
        success: false,
        message: "Validation Error",
        error: `Bad Request: User with email '${normalizedEmail}' already exists.`,
      };
    }

    // 4. Transactional Merchant Provisioning Execution
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours

    let companyRecord;
    let userRecord;
    let sessionRecord;

    try {
      const result = await prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: {
            code: normalizedCode,
            legalName,
            displayName,
            taxId: input.taxId?.trim() || null,
            isActive: true,
          },
        });

        const user = await tx.user.create({
          data: {
            companyId: company.id,
            email: normalizedEmail,
            firstName: adminFirstName,
            lastName: adminLastName,
            role: Role.ADMIN,
            isActive: false, // Inactive until self-service password activation
            passwordHash: "", // Zero password generated
          },
        });

        const session = await tx.session.create({
          data: {
            userId: user.id,
            tokenHash,
            expiresAt,
          },
        });

        return { company, user, session };
      });

      companyRecord = result.company;
      userRecord = result.user;
      sessionRecord = result.session;
    } catch (err: any) {
      return {
        success: false,
        message: "Provisioning Error",
        error: err.message || "Failed to provision merchant records.",
      };
    }

    // 5. Fail-Closed SMTP Email Transmission
    const emailProvider = new SMTPEmailProvider();
    const activationUrl = `https://app.splinci.com/login?mode=activate&token=${rawToken}`;

    const emailBodyText = `Hello ${userRecord.firstName},

You have been invited as the Primary Administrator for ${companyRecord.displayName} on Splinci Commerce OS.

Company: ${companyRecord.displayName} (${companyRecord.code})
Role: Primary Administrator (${userRecord.role})

Please set your administrator password and activate your account by clicking the secure link below:

${activationUrl}

This activation link is single-use and will expire in 24 hours. No temporary password has been set.

If you did not request this account, please contact info@splinci.com.

Regards,
Splinci Commerce OS Enterprise Platform Operations`;

    let invitationStatus: "SENT" | "INVITATION_FAILED" = "SENT";
    let deliveryError: string | undefined;

    try {
      const emailResult = await emailProvider.sendEmail({
        companyId: companyRecord.id,
        to: userRecord.email,
        subject: `Activate Your Splinci Commerce OS Account — ${companyRecord.displayName}`,
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
      return {
        success: false,
        message: "Merchant Created (Invitation Delivery Failed)",
        error: `Service Unavailable: ${deliveryError}`,
        data: {
          companyId: companyRecord.id,
          companyCode: companyRecord.code,
          companyName: companyRecord.displayName,
          adminUserId: userRecord.id,
          adminEmail: userRecord.email,
          invitationStatus: "INVITATION_FAILED",
        },
      };
    }

    return {
      success: true,
      message: "Merchant tenant provisioned and activation invitation delivered successfully.",
      data: {
        companyId: companyRecord.id,
        companyCode: companyRecord.code,
        companyName: companyRecord.displayName,
        adminUserId: userRecord.id,
        adminEmail: userRecord.email,
        invitationStatus: "SENT",
      },
    };
  }
}

export const merchantOnboardingService = new MerchantOnboardingService();
