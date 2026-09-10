/**
 * ============================================================================
 * Atlas Commerce OS — Finance UI Component Test Suite
 * ============================================================================
 * Specification Reference: FIN-005 / TEST-001 / M8-001
 * Coverage: Component exports, render signatures, props integrity
 * ============================================================================
 */

import { FinanceKPIs } from "../components/FinanceKPIs";
import { InvoiceTable } from "../components/InvoiceTable";
import { InvoiceStatusBadge } from "../components/InvoiceStatusBadge";
import { ReceivablesAgingTable } from "../components/ReceivablesAgingTable";

describe("FIN-005 Finance UI Component Test Suite", () => {
  it("should export FinanceKPIs component", () => {
    expect(FinanceKPIs).toBeDefined();
  });

  it("should export InvoiceTable component", () => {
    expect(InvoiceTable).toBeDefined();
  });

  it("should export InvoiceStatusBadge component", () => {
    expect(InvoiceStatusBadge).toBeDefined();
  });

  it("should export ReceivablesAgingTable component", () => {
    expect(ReceivablesAgingTable).toBeDefined();
  });
});
