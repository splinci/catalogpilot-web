/**
 * ============================================================================
 * Atlas Commerce OS — Sales Quotation Repository Implementation
 * ============================================================================
 * Specification Reference: ORD-001 / M6-001 / BSD-005 / DBA-003
 * Entity: SalesQuotation Aggregate Root
 * 
 * Responsibilities:
 * - Multi-tenant SalesQuotation query isolation (`companyId`)
 * - Atomic sales quotation creation with auto-generated QT number
 * - Transactional conversion of SalesQuotation to SalesOrder
 * ============================================================================
 */

import { BaseRepository } from "./base/base.repository";
import { OrderStatus } from "@prisma/client";

export interface CreateQuotationLineInput {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export class SalesQuotationRepository extends BaseRepository {
  /**
   * Find Sales Quotation by ID with tenant isolation.
   */
  async findById(companyId: string, id: string) {
    const quotation = await this.prisma.salesQuotation.findFirst({
      where: { id, companyId },
      include: {
        company: { select: { id: true, legalName: true, displayName: true } },
      },
    });

    return quotation;
  }

  /**
   * Paginated list of sales quotations for company tenant.
   */
  async findMany(companyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.salesQuotation.findMany({
        where: { companyId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.salesQuotation.count({ where: { companyId } }),
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
   * Create Sales Quotation record.
   */
  async createQuotation(
    companyId: string,
    customerId: string,
    validUntil: Date,
    totalAmount: number
  ) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await this.prisma.salesQuotation.count({ where: { companyId } });
    const quoteNumber = `QT-${dateStr}-${(count + 1).toString().padStart(4, "0")}`;

    return this.prisma.salesQuotation.create({
      data: {
        companyId,
        quoteNumber,
        customerId,
        totalAmount,
        validUntil,
      },
    });
  }

  /**
   * Convert Sales Quotation to SalesOrder in an atomic transaction.
   */
  async convertToSalesOrder(
    companyId: string,
    quotationId: string,
    lines: CreateQuotationLineInput[],
    userId?: string
  ) {
    return this.prisma.$transaction(async (tx) => {
      const quotation = await tx.salesQuotation.findFirst({
        where: { id: quotationId, companyId },
      });

      if (!quotation) {
        throw new Error("Sales quotation not found or access denied");
      }

      if (new Date() > quotation.validUntil) {
        throw new Error("Sales quotation has expired and cannot be converted to a Sales Order");
      }

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const orderCount = await tx.salesOrder.count({ where: { companyId } });
      const orderNumber = `SO-${dateStr}-${(orderCount + 1).toString().padStart(4, "0")}`;

      const subtotal = lines.reduce((acc, line) => acc + line.quantity * line.unitPrice, 0);

      const salesOrder = await tx.salesOrder.create({
        data: {
          companyId,
          orderNumber,
          customerId: quotation.customerId,
          status: OrderStatus.DRAFT,
          subtotal,
          taxTotal: 0,
          shippingFee: 0,
          totalAmount: subtotal,
          createdBy: userId,
          updatedBy: userId,
          lines: {
            create: lines.map((line) => ({
              companyId,
              productId: line.productId,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              totalPrice: line.quantity * line.unitPrice,
            })),
          },
        },
        include: {
          lines: true,
          customer: true,
        },
      });

      return salesOrder;
    });
  }
}

export const salesQuotationRepository = new SalesQuotationRepository();
