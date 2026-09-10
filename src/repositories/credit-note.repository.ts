/**
 * ============================================================================
 * Atlas Commerce OS — Credit Note Repository Layer
 * ============================================================================
 * Specification Reference: FIN-002 / M8-001 / DAT-001
 * Domain: Credit Notes & Billing Offsets Data Access Layer
 * ============================================================================
 */

import { prisma } from "@/lib/prisma";
import { CreateCreditNoteInput } from "@/types/finance.dto";

export class CreditNoteRepository {
  /**
   * Find credit notes for a tenant.
   */
  async findMany(companyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.creditNote.findMany({
        where: {
          invoice: {
            companyId,
          },
        },
        skip,
        take: limit,
        orderBy: { id: "desc" },
        include: {
          invoice: {
            include: {
              customer: true,
            },
          },
        },
      }),
      prisma.creditNote.count({
        where: {
          invoice: {
            companyId,
          },
        },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create a credit note offsetting an invoice.
   */
  async create(companyId: string, data: CreateCreditNoteInput) {
    const cnNumber = data.cnNumber || `CN-${Math.floor(100000 + Math.random() * 900000)}`;

    return prisma.creditNote.create({
      data: {
        invoiceId: data.invoiceId,
        cnNumber,
        amount: data.amount,
        reason: data.reason,
      },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
    });
  }
}

export const creditNoteRepository = new CreditNoteRepository();
