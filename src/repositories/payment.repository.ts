/**
 * ============================================================================
 * Atlas Commerce OS — Payment Repository Layer
 * ============================================================================
 * Specification Reference: FIN-002 / M8-001 / DAT-001
 * Domain: Incoming Payments Data Access Layer
 * ============================================================================
 */

import { prisma } from "@/lib/prisma";
import { RecordPaymentInput } from "@/types/finance.dto";

export class PaymentRepository {
  /**
   * Find paginated Payments for a specific tenant.
   */
  async findMany(companyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where: { companyId, deletedAt: null },
        skip,
        take: limit,
        orderBy: { paidAt: "desc" },
        include: {
          invoice: {
            include: {
              customer: true,
            },
          },
        },
      }),
      prisma.payment.count({ where: { companyId, deletedAt: null } }),
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
   * Record a new incoming payment against an invoice.
   */
  async create(companyId: string, data: RecordPaymentInput) {
    return prisma.payment.create({
      data: {
        companyId,
        invoiceId: data.invoiceId,
        amount: data.amount,
        method: data.method,
        reference: data.reference,
        paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
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

export const paymentRepository = new PaymentRepository();
