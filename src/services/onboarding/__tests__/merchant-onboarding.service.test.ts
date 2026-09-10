import { describe, it, expect, beforeEach, vi } from "vitest";
import { merchantOnboardingService } from "../merchant-onboarding.service";
import { UserSessionPayload } from "@/types/auth.dto";
import { Role } from "@prisma/client";

const mockPlatformAdminSession: UserSessionPayload = {
  userId: "usr_splinci_admin_01",
  email: "info@splinci.com",
  firstName: "Splinci",
  lastName: "Platform Operator",
  role: Role.ADMIN,
  companyId: "cmp_splinci_01",
  companyCode: "SPLINCI",
  companyName: "Splinci Commerce OS Inc.",
};

const mockMerchantAdminSession: UserSessionPayload = {
  userId: "usr_merchant_admin_01",
  email: "admin@merchant.com",
  firstName: "Merchant",
  lastName: "Admin",
  role: Role.ADMIN,
  companyId: "cmp_merchant_01",
  companyCode: "MERCHANT_01",
  companyName: "Merchant Store Inc.",
};

describe("MerchantOnboardingService & Platform Admin Authorization Unit Tests", () => {
  it("should deny merchant onboarding when caller is not authenticated (null session)", async () => {
    const result = await merchantOnboardingService.onboardMerchant(
      {
        legalName: "Test Merchant Inc.",
        displayName: "Test Merchant",
        companyCode: "TEST_M1",
        country: "US",
        currency: "USD",
        timezone: "America/New_York",
        adminFirstName: "John",
        adminLastName: "Doe",
        adminEmail: "john@testmerchant.com",
      },
      null
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Forbidden");
  });

  it("should deny merchant onboarding when caller is a normal MERCHANT_ADMIN", async () => {
    const result = await merchantOnboardingService.onboardMerchant(
      {
        legalName: "Test Merchant Inc.",
        displayName: "Test Merchant",
        companyCode: "TEST_M2",
        country: "US",
        currency: "USD",
        timezone: "America/New_York",
        adminFirstName: "John",
        adminLastName: "Doe",
        adminEmail: "john2@testmerchant.com",
      },
      mockMerchantAdminSession
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Forbidden");
  });

  it("should reject onboarding when required parameters are missing", async () => {
    const result = await merchantOnboardingService.onboardMerchant(
      {
        legalName: "",
        displayName: "",
        companyCode: "",
        country: "US",
        currency: "USD",
        timezone: "America/New_York",
        adminFirstName: "",
        adminLastName: "",
        adminEmail: "invalid",
      },
      mockPlatformAdminSession
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Bad Request");
  });

  it("should reject onboarding when administrator email format is invalid", async () => {
    const result = await merchantOnboardingService.onboardMerchant(
      {
        legalName: "Valid Company Ltd",
        displayName: "Valid Company",
        companyCode: "VALID_CODE_01",
        country: "US",
        currency: "USD",
        timezone: "America/New_York",
        adminFirstName: "Valid",
        adminLastName: "User",
        adminEmail: "invalid-email-address",
      },
      mockPlatformAdminSession
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid administrator email format");
  });
});
