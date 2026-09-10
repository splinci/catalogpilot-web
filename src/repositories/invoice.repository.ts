/**
 * ============================================================================
 * Atlas Commerce OS — Invoice Repository Layer
 * ============================================================================
 * Specification Reference: FIN-002 / M8-001 / DAT-001
 * Domain: Accounts Receivable (AR) Invoicing Data Access Layer
 * 
 * Responsibilities:
 * - Multi-tenant Invoice aggregate persistence (companyId isolated)
 * - Customer & Sales Order billing relationship queries
 * - Paginated list queries with status filtering
 * - Optimistic concurrency versioning
 * - Soft deletion
 * ============================================================================
 */

import { prisma } from "@/lib/prisma";
import { CreateInvoiceInput, InvoiceQueryInput, UpdateInvoiceInput } from "@/types/finance.dto";
import { InvoiceStatus, Prisma } from "@prisma/client";

export class InvoiceRepository {
  /**
   * Find paginated Invoices for a specific tenant.
   */
  async findMany(companyId: string, query: InvoiceQueryInput) {
    const { page, limit, search, status, customerId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {
      companyId,
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(customerId ? { customerId } : {}),
      ...(search
        ? {
            OR: [
              { invoiceNumber: { contains: search, mode: "insensitive" } },
              { customer: { legalName: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: true,
          salesOrder: true,
          payments: true,
          creditNotes: true,
        },
      }),
      prisma.invoice.count({ where }),
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
   * Find a single Invoice by ID with payments and credit notes.
   */
  async findById(companyId: string, id: string) {
    return prisma.invoice.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        customer: true,
        salesOrder: {
          include: {
            lines: {
              include: {
                product: true,
              },
            },
          },
        },
        payments: true,
        creditNotes: true,
      },
    });
  }

  /**
   * Create a new Invoice aggregate.
   */
  async create(companyId: string, data: CreateInvoiceInput, userId?: string) {
    const invoiceNumber = data.invoiceNumber || `INV-${Math.floor(100000 + Math.random() * 900000)}`;

    return prisma.invoice.create({
      data: {
        companyId,
        invoiceNumber,
        customerId: data.customerId,
        salesOrderId: data.salesOrderId,
        totalAmount: data.totalAmount,
        dueDate: new Date(data.dueDate),
        status: InvoiceStatus.DRAFT,
        createdBy: userId,
      },
      include: {
        customer: true,
        salesOrder: true,
      },
    });
  }

  /**
   * Update Invoice status (DRAFT -> ISSUED -> PAID / CANCELLED).
   */
  async updateStatus(companyId: string, id: string, status: InvoiceStatus, userId?: string) {
    const existing = await this.findById(companyId, id);
    if (!existing) {
      throw new Error("Invoice not found or access denied");
    }

    return prisma.invoice.update({
      where: { id },
      data: {
        status,
        postedAt: status === InvoiceStatus.ISSUED ? new Date() : existing.postedAt,
        updatedBy: userId,
        version: { increment: 1 },
      },
      include: {
        customer: true,
        payments: true,
      },
    });
  }

  /**
   * Soft delete Invoice record.
   */
  async archive(companyId: string, id: string, userId?: string) {
    const existing = await this.findById(companyId, id);
    if (!existing) {
      throw new Error("Invoice not found or access denied");
    }

    return prisma.invoice.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }
}

export const invoiceRepository = new InvoiceRepository();
