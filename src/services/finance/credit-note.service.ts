/**
 * ============================================================================
 * Atlas Commerce OS — Credit Note Domain Service
 * ============================================================================
 * Specification Reference: FIN-003 / M8-001 / DDD-001
 * Domain: Credit Memos & Invoice Offset Logic
 * ============================================================================
 */

import { creditNoteRepository, CreditNoteRepository } from "@/repositories/credit-note.repository";
import { invoiceRepository, InvoiceRepository } from "@/repositories/invoice.repository";
import { auditService, AuditService } from "../audit.service";
import { UserSessionPayload } from "@/types/auth.dto";
import { CreateCreditNoteInput } from "@/types/finance.dto";
import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class CreditNoteService {
  constructor(
    private creditNoteRepo: CreditNoteRepository = creditNoteRepository,
    private invoiceRepo: InvoiceRepository = invoiceRepository,
    private audit: AuditService = auditService
  ) {}

  /**
   * Create a credit note offsetting an invoice.
   */
  async createCreditNote(session: UserSessionPayload, input: CreateCreditNoteInput) {
    const invoice = await this.invoiceRepo.findById(session.companyId, input.invoiceId);
    if (!invoice) {
      throw new Error("Target invoice not found.");
    }

    const creditNote = await this.creditNoteRepo.create(session.companyId, input);

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "CreditNoteIssued",
        payload: {
          creditNoteId: creditNote.id,
          cnNumber: creditNote.cnNumber,
          invoiceId: invoice.id,
          amount: Number(creditNote.amount),
        },
      },
    });

    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: AuditAction.USER_UPDATED,
      entityName: "CreditNote",
      entityId: creditNote.id,
      details: {
        cnNumber: creditNote.cnNumber,
        invoiceId: invoice.id,
        amount: Number(creditNote.amount),
      },
    });

    return creditNote;
  }
}

export const creditNoteService = new CreditNoteService();
