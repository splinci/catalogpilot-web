/**
 * ============================================================================
 * Atlas Commerce OS — Finance REST API Test Suite
 * ============================================================================
 * Specification Reference: FIN-004 / TEST-001 / M8-001
 * Target System: REST API Route Handlers under /api/finance/*
 * Coverage: Route Handler Export & Signature Verification
 * ============================================================================
 */

import { GET as getInvoices, POST as createInvoice } from "../invoices/route";
import { GET as getInvoiceById, DELETE as archiveInvoice } from "../invoices/[id]/route";
import { GET as getPayments, POST as recordPayment } from "../payments/route";
import { GET as getCreditNotes, POST as createCreditNote } from "../credit-notes/route";
import { GET as getReceivables } from "../receivables/route";
import { GET as getAnalytics } from "../analytics/route";

describe("FIN-004 Finance REST API Test Suite", () => {
  it("should export invoice list and creation route handlers", () => {
    expect(getInvoices).toBeDefined();
    expect(createInvoice).toBeDefined();
  });

  it("should export invoice detail and archive route handlers", () => {
    expect(getInvoiceById).toBeDefined();
    expect(archiveInvoice).toBeDefined();
  });

  it("should export payment route handlers", () => {
    expect(getPayments).toBeDefined();
    expect(recordPayment).toBeDefined();
  });

  it("should export credit note route handlers", () => {
    expect(getCreditNotes).toBeDefined();
    expect(createCreditNote).toBeDefined();
  });

  it("should export receivables and analytics route handlers", () => {
    expect(getReceivables).toBeDefined();
    expect(getAnalytics).toBeDefined();
  });
});
