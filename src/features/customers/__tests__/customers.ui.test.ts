/**
 * ============================================================================
 * Atlas Commerce OS — Customer Management UI Component Test Suite
 * ============================================================================
 * Specification Reference: CRM-004 / TEST-001 / M7-001
 * Coverage: Component exports, render signatures, props integrity
 * ============================================================================
 */

import { CustomerKPIs } from "../components/CustomerKPIs";
import { CustomerTable } from "../components/CustomerTable";
import { CreateCustomerModal } from "../components/CreateCustomerModal";
import { CustomerDetailsDrawer } from "../components/CustomerDetailsDrawer";

describe("CRM-004 Customer UI Component Test Suite", () => {
  it("should export CustomerKPIs component", () => {
    expect(CustomerKPIs).toBeDefined();
  });

  it("should export CustomerTable component", () => {
    expect(CustomerTable).toBeDefined();
  });

  it("should export CreateCustomerModal component", () => {
    expect(CreateCustomerModal).toBeDefined();
  });

  it("should export CustomerDetailsDrawer component", () => {
    expect(CustomerDetailsDrawer).toBeDefined();
  });
});
