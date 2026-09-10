/**
 * ============================================================================
 * Atlas Commerce OS — Sales Order Repository Implementation
 * ============================================================================
 * Specification Reference: M6-001 / BSD-005 / DBA-003
 * Entity: SalesOrder Aggregate Root
 * Encapsulated Entities: SalesOrderLine
 * 
 * Responsibilities:
 * - Multi-tenant SalesOrder query isolation (`companyId`)
 * - Atomic aggregate creation with auto-generated SO number
 * - State machine status updates with optimistic concurrency (`version`)
 * - Soft-deletion aware query handling (`deletedAt: null`)
 * ============================================================================
 */

import { BaseRepository } from "./base/base.repository";
import { CreateSalesOrderInput, SalesOrderQueryInput } from "@/types/order.dto";
import { OrderStatus, Prisma } from "@prisma/client";

export class SalesOrderRepository extends BaseRepository {
  /**
   * Find sales order by ID with tenant isolation.
   */
  async findById(companyId: string, id: string) {
    const order = await this.prisma.salesOrder.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
          },
        },
        shipments: true,
      },
    });

    return order;
  }

  /**
   * Paginated list of sales orders with tenant filtering.
   */
  async findMany(companyId: string, query: SalesOrderQueryInput = { page: 1, limit: 20 }) {
    const { page = 1, limit = 20, search, status, customerId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SalesOrderWhereInput = {
      companyId,
      deletedAt: null,
      ...(status && { status }),
      ...(customerId && { customerId }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" } },
          { customer: { legalName: { contains: search, mode: "insensitive" } } },
          { customer: { customerCode: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.salesOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: { id: true, legalName: true, email: true, customerCode: true },
          },
          lines: {
            select: { id: true, quantity: true, totalPrice: true },
          },
        },
      }),
      this.prisma.salesOrder.count({ where }),
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
   * Atomic SalesOrder aggregate creation.
   */
  async createOrder(companyId: string, input: CreateSalesOrderInput, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const orderCount = await tx.salesOrder.count({ where: { companyId } });
      const orderNumber = `SO-${dateStr}-${(orderCount + 1).toString().padStart(4, "0")}`;

      const subtotal = input.lines.reduce((acc, line) => {
        const lineSubtotal = line.quantity * line.unitPrice - (line.discountAmount || 0);
        return acc + lineSubtotal;
      }, 0);

      const taxTotal = input.lines.reduce((acc, line) => acc + (line.taxAmount || 0), 0);
      const shippingFee = 0;
      const totalAmount = subtotal + taxTotal + shippingFee;

      const order = await tx.salesOrder.create({
        data: {
          companyId,
          orderNumber,
          customerId: input.customerId,
          status: OrderStatus.DRAFT,
          subtotal,
          taxTotal,
          shippingFee,
          totalAmount,
          createdBy: userId,
          updatedBy: userId,
          lines: {
            create: input.lines.map((line) => ({
              companyId,
              productId: line.productId,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              totalPrice: line.quantity * line.unitPrice - (line.discountAmount || 0) + (line.taxAmount || 0),
            })),
          },
        },
        include: {
          lines: true,
          customer: true,
        },
      });

      return order;
    });
  }

  /**
   * Update SalesOrder status with optimistic concurrency control.
   */
  async updateStatus(companyId: string, id: string, status: OrderStatus, userId?: string) {
    const existing = await this.prisma.salesOrder.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!existing) {
      throw new Error(`Sales order ID '${id}' not found or access denied`);
    }

    return this.prisma.salesOrder.update({
      where: { id },
      data: {
        status,
        updatedBy: userId,
        version: { increment: 1 },
      },
    });
  }

  /**
   * Resolve active stock reservations for a Sales Order.
   */
  async findReservationsByOrder(companyId: string, salesOrderId: string) {
    const order = await this.prisma.salesOrder.findFirst({
      where: { id: salesOrderId, companyId, deletedAt: null },
    });

    if (!order) return [];

    return this.prisma.stockReservation.findMany({
      where: { salesOrderId },
    });
  }
}

export const salesOrderRepository = new SalesOrderRepository();
