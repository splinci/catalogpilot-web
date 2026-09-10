/**
 * ============================================================================
 * Atlas Commerce OS — Finance Policy Engine
 * ============================================================================
 * Specification Reference: FIN-003 / M8-001 / DDD-001
 * Domain: Financial Business Rules & Verification Engine
 * 
 * Responsibilities:
 * - Pure validation rules engine (0% Prisma / 0% database access)
 * - Invoice lifecycle state machine rules
 * - Payment allocation & balance calculations
 * - Invoice aging bucket classification
 * - Void & write-off eligibility checks
 * ============================================================================
 */

import { InvoiceStatus } from "@prisma/client";

export class FinancePolicy {
  /**
   * Validate invoice creation parameters.
   */
  static validateCreateInvoice(totalAmount: number, dueDate: Date) {
    if (totalAmount <= 0) {
      throw new Error("Invoice total amount must be strictly greater than zero.");
    }

    if (dueDate.getTime() < Date.now() - 86400000) {
      throw new Error("Invoice due date cannot be in the past.");
    }
  }

  /**
   * Verify invoice status transition eligibility.
   */
  static validateStatusTransition(currentStatus: InvoiceStatus, targetStatus: InvoiceStatus) {
    if (currentStatus === InvoiceStatus.PAID) {
      throw new Error("Paid invoices are final and cannot undergo status transitions.");
    }

    if (currentStatus === InvoiceStatus.CANCELLED) {
      throw new Error("Cancelled invoices cannot undergo status transitions.");
    }

    if (targetStatus === InvoiceStatus.ISSUED && currentStatus !== InvoiceStatus.DRAFT) {
      throw new Error("Only DRAFT invoices can be ISSUED.");
    }
  }

  /**
   * Validate payment recording & allocation rules.
   */
  static validatePaymentAllocation(paymentAmount: number, invoiceTotal: number, currentAmountPaid: number) {
    if (paymentAmount <= 0) {
      throw new Error("Payment amount must be strictly positive.");
    }

    const currentBalance = invoiceTotal - currentAmountPaid;
    if (paymentAmount > currentBalance) {
      // Overpayment allowed by business policy, but flagged
      return { isOverpayment: true, excessAmount: paymentAmount - currentBalance };
    }

    return { isOverpayment: false, excessAmount: 0 };
  }

  /**
   * Calculate invoice aging bucket.
   */
  static calculateAgingBucket(dueDate: Date, isPaid: boolean): "CURRENT" | "1-30" | "31-60" | "61-90" | "90+" {
    if (isPaid) return "CURRENT";

    const diffMs = Date.now() - dueDate.getTime();
    if (diffMs <= 0) return "CURRENT";

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 30) return "1-30";
    if (diffDays <= 60) return "31-60";
    if (diffDays <= 90) return "61-90";
    return "90+";
  }

  /**
   * Verify void eligibility.
   */
  static validateVoidEligibility(status: InvoiceStatus, hasPayments: boolean) {
    if (hasPayments) {
      throw new Error("Invoices with recorded payments cannot be voided. Issue a credit note or payment reversal instead.");
    }

    if (status === InvoiceStatus.PAID) {
      throw new Error("Fully paid invoices cannot be voided.");
    }
  }
}
