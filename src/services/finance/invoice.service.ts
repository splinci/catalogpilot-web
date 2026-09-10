/**
 * ============================================================================
 * Atlas Commerce OS — Invoice Domain Service
 * ============================================================================
 * Specification Reference: FIN-003 / M8-001 / DDD-001
 * Domain: Accounts Receivable Invoice Orchestration & Event Dispatching
 * ============================================================================
 */

import { invoiceRepository, InvoiceRepository } from "@/repositories/invoice.repository";
import { FinancePolicy } from "./finance.policy";
import { auditService, AuditService } from "../audit.service";
import { UserSessionPayload } from "@/types/auth.dto";
import { CreateInvoiceInput } from "@/types/finance.dto";
import { AuditAction, InvoiceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class InvoiceService {
  constructor(
    private invoiceRepo: InvoiceRepository = invoiceRepository,
    private audit: AuditService = auditService
  ) {}

  /**
   * Create a new Invoice aggregate.
   */
  async createInvoice(session: UserSessionPayload, input: CreateInvoiceInput) {
    FinancePolicy.validateCreateInvoice(input.totalAmount, new Date(input.dueDate));

    const invoice = await this.invoiceRepo.create(session.companyId, input, session.userId);

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "InvoiceCreated",
        payload: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customerId: invoice.customerId,
          totalAmount: Number(invoice.totalAmount),
          dueDate: invoice.dueDate.toISOString(),
        },
      },
    });

    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: AuditAction.USER_CREATED,
      entityName: "Invoice",
      entityId: invoice.id,
      details: {
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: Number(invoice.totalAmount),
      },
    });

    return invoice;
  }

  /**
   * Issue a DRAFT invoice.
   */
  async issueInvoice(session: UserSessionPayload, id: string) {
    const existing = await this.invoiceRepo.findById(session.companyId, id);
    if (!existing) {
      throw new Error("Invoice not found");
    }

    FinancePolicy.validateStatusTransition(existing.status, InvoiceStatus.ISSUED);

    const updated = await this.invoiceRepo.updateStatus(
      session.companyId,
      id,
      InvoiceStatus.ISSUED,
      session.userId
    );

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "InvoiceIssued",
        payload: {
          invoiceId: updated.id,
          invoiceNumber: updated.invoiceNumber,
          customerId: updated.customerId,
          totalAmount: Number(updated.totalAmount),
          postedAt: updated.postedAt?.toISOString(),
        },
      },
    });

    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: AuditAction.INVOICE_POSTED,
      entityName: "Invoice",
      entityId: updated.id,
      details: {
        invoiceNumber: updated.invoiceNumber,
        status: InvoiceStatus.ISSUED,
      },
    });

    return updated;
  }

  /**
   * Void an Invoice.
   */
  async voidInvoice(session: UserSessionPayload, id: string) {
    const existing = await this.invoiceRepo.findById(session.companyId, id);
    if (!existing) {
      throw new Error("Invoice not found");
    }

    const hasPayments = existing.payments && existing.payments.length > 0;
    FinancePolicy.validateVoidEligibility(existing.status, hasPayments);

    const updated = await this.invoiceRepo.updateStatus(
      session.companyId,
      id,
      InvoiceStatus.CANCELLED,
      session.userId
    );

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "InvoiceVoided",
        payload: {
          invoiceId: updated.id,
          invoiceNumber: updated.invoiceNumber,
          customerId: updated.customerId,
        },
      },
    });

    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: AuditAction.USER_UPDATED,
      entityName: "Invoice",
      entityId: updated.id,
      details: {
        invoiceNumber: updated.invoiceNumber,
        status: InvoiceStatus.CANCELLED,
      },
    });

    return updated;
  }
}

export const invoiceService = new InvoiceService();
