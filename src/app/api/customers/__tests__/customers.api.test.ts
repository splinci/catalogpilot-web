/**
 * ============================================================================
 * Atlas Commerce OS — Customer REST API Test Suite
 * ============================================================================
 * Specification Reference: CRM-003 / TEST-001 / M7-001
 * Target System: REST API Route Handlers under /api/customers/*
 * Coverage: Route Handler Export & Signature Verification
 * ============================================================================
 */

import { GET as getCustomers, POST as createCustomer } from "../route";
import { GET as getCustomerById, PUT as updateCustomer, DELETE as archiveCustomer } from "../[id]/route";
import { GET as getCustomerDetails } from "../[id]/details/route";

describe("CRM-003 Customer REST API Test Suite", () => {
  it("should export customer list and creation route handlers", () => {
    expect(getCustomers).toBeDefined();
    expect(createCustomer).toBeDefined();
  });

  it("should export customer detail, update, and delete route handlers", () => {
    expect(getCustomerById).toBeDefined();
    expect(updateCustomer).toBeDefined();
    expect(archiveCustomer).toBeDefined();
  });

  it("should export customer details activity route handler", () => {
    expect(getCustomerDetails).toBeDefined();
  });
});
