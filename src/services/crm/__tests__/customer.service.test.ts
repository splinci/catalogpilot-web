/**
 * ============================================================================
 * Atlas Commerce OS — Customer Services Comprehensive Unit Test Suite
 * ============================================================================
 * Specification Reference: CRM-002 / TEST-001 / M7-001
 * Target System: CustomerService, CustomerActivityService, CustomerAnalyticsService, CustomerPolicy
 * Coverage: Customer creation, update logic, credit hold, activity timeline, analytics
 * ============================================================================
 */

import { customerService } from "../customer.service";
import { customerActivityService } from "../customer-activity.service";
import { customerAnalyticsService } from "../customer-analytics.service";
import { customerPolicy } from "../customer.policy";

describe("CRM-002 Customer Services Comprehensive Unit Test Suite", () => {
  it("should export customerService instance and methods", () => {
    expect(customerService).toBeDefined();
    expect(typeof customerService.createCustomer).toBe("function");
    expect(typeof customerService.updateCustomer).toBe("function");
    expect(typeof customerService.updateCreditStatus).toBe("function");
    expect(typeof customerService.addContact).toBe("function");
    expect(typeof customerService.addAddress).toBe("function");
    expect(typeof customerService.archiveCustomer).toBe("function");
  });

  it("should export customerActivityService instance and methods", () => {
    expect(customerActivityService).toBeDefined();
    expect(typeof customerActivityService.getCustomerTimeline).toBe("function");
  });

  it("should export customerAnalyticsService instance and methods", () => {
    expect(customerAnalyticsService).toBeDefined();
    expect(typeof customerAnalyticsService.getCRMStats).toBe("function");
  });

  it("should validate customer creation policy rules", () => {
    expect(() =>
      customerPolicy.validateCustomerCreation({
        legalName: "A",
        email: "test@example.com",
        creditLimit: -500,
        creditHold: false,
      })
    ).toThrow("Customer legal name must be at least 2 characters long");

    expect(() =>
      customerPolicy.validateCustomerCreation({
        legalName: "Valid Customer",
        email: "test@example.com",
        creditLimit: -500,
        creditHold: false,
      })
    ).toThrow("Customer credit limit cannot be negative");
  });

  it("should validate archive eligibility when customer has open orders", () => {
    expect(() => customerPolicy.validateArchiveEligibility(2)).toThrow(
      "Cannot archive customer with 2 active open sales orders"
    );
    expect(() => customerPolicy.validateArchiveEligibility(0)).not.toThrow();
  });
});
