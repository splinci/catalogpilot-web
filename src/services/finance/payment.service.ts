/**
 * ============================================================================
 * Atlas Commerce OS — Payment Domain Service
 * ============================================================================
 * Specification Reference: FIN-003 / M8-001 / DDD-001
 * Domain: Incoming Payments & Invoice Allocation Engine
 * ============================================================================
 */

import { paymentRepository, PaymentRepository } from "@/repositories/payment.repository";
import { invoiceRepository, InvoiceRepository } from "@/repositories/invoice.repository";
import { FinancePolicy } from "./finance.policy";
import { auditService, AuditService } from "../audit.service";
import { UserSessionPayload } from "@/types/auth.dto";
import { RecordPaymentInput } from "@/types/finance.dto";
import { AuditAction, InvoiceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class PaymentService {
  constructor(
    private paymentRepo: PaymentRepository = paymentRepository,
    private invoiceRepo: InvoiceRepository = invoiceRepository,
    private audit: AuditService = auditService
  ) {}

  /**
   * Record a payment and allocate it against an open invoice.
   */
  async recordPayment(session: UserSessionPayload, input: RecordPaymentInput) {
    const invoice = await this.invoiceRepo.findById(session.companyId, input.invoiceId);
    if (!invoice) {
      throw new Error("Target invoice not found.");
    }

    let currentPaid = 0;
    if (invoice.payments && invoice.payments.length > 0) {
      currentPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    }

    FinancePolicy.validatePaymentAllocation(input.amount, Number(invoice.totalAmount), currentPaid);

    const payment = await this.paymentRepo.create(session.companyId, input);

    const newTotalPaid = currentPaid + input.amount;
    const isFullyPaid = newTotalPaid >= Number(invoice.totalAmount);
    const targetStatus = isFullyPaid ? InvoiceStatus.PAID : InvoiceStatus.ISSUED;

    await this.invoiceRepo.updateStatus(session.companyId, invoice.id, targetStatus, session.userId);

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: isFullyPaid ? "InvoicePaid" : "PaymentReceived",
        payload: {
          paymentId: payment.id,
          invoiceId: invoice.id,
          amount: Number(payment.amount),
          newTotalPaid,
          status: targetStatus,
        },
      },
    });

    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: AuditAction.USER_UPDATED,
      entityName: "Payment",
      entityId: payment.id,
      details: {
        invoiceId: invoice.id,
        amount: Number(payment.amount),
        targetStatus,
      },
    });

    return payment;
  }
}

export const paymentService = new PaymentService();
