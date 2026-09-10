/**
 * ============================================================================
 * Atlas Commerce OS — Finance Services Unit Test Suite
 * ============================================================================
 * Specification Reference: FIN-003 / TEST-001 / M8-001
 * Target System: InvoiceService, PaymentService, CreditNoteService, FinancePolicy
 * Coverage: Policy validation, Invoice creation/issuance, Aging bucket calculation
 * ============================================================================
 */

import { FinancePolicy } from "../finance.policy";
import { invoiceService } from "../invoice.service";
import { paymentService } from "../payment.service";
import { creditNoteService } from "../credit-note.service";
import { receivablesService } from "../receivables.service";
import { financeAnalyticsService } from "../finance-analytics.service";
import { InvoiceStatus } from "@prisma/client";

describe("FIN-003 Finance Service Layer Test Suite", () => {
  describe("FinancePolicy Unit Tests", () => {
    it("should reject negative or zero invoice totals", () => {
      expect(() => FinancePolicy.validateCreateInvoice(0, new Date())).toThrow(
        "Invoice total amount must be strictly greater than zero."
      );
    });

    it("should reject illegal status transitions", () => {
      expect(() =>
        FinancePolicy.validateStatusTransition(InvoiceStatus.PAID, InvoiceStatus.ISSUED)
      ).toThrow("Paid invoices are final and cannot undergo status transitions.");
    });

    it("should classify aging buckets accurately", () => {
      const today = new Date();
      expect(FinancePolicy.calculateAgingBucket(today, false)).toBe("CURRENT");

      const past45Days = new Date(Date.now() - 45 * 86400000);
      expect(FinancePolicy.calculateAgingBucket(past45Days, false)).toBe("31-60");
    });
  });

  describe("Domain Services Export Verification", () => {
    it("should export invoiceService methods", () => {
      expect(invoiceService).toBeDefined();
      expect(typeof invoiceService.createInvoice).toBe("function");
      expect(typeof invoiceService.issueInvoice).toBe("function");
      expect(typeof invoiceService.voidInvoice).toBe("function");
    });

    it("should export paymentService methods", () => {
      expect(paymentService).toBeDefined();
      expect(typeof paymentService.recordPayment).toBe("function");
    });

    it("should export creditNoteService methods", () => {
      expect(creditNoteService).toBeDefined();
      expect(typeof creditNoteService.createCreditNote).toBe("function");
    });

    it("should export receivables and analytics services", () => {
      expect(receivablesService).toBeDefined();
      expect(typeof receivablesService.getAgingReport).toBe("function");

      expect(financeAnalyticsService).toBeDefined();
      expect(typeof financeAnalyticsService.getSummaryMetrics).toBe("function");
    });
  });
});
