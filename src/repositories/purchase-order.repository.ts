/**
 * ============================================================================
 * Atlas Commerce OS — Purchase Order Repository Implementation
 * ============================================================================
 * Specification Reference: PUR-001 / BSD-004 / M5-001
 * Aggregate Root: PurchaseOrder
 * Encapsulated Entities: PurchaseOrderLine, GoodsReceipt
 * 
 * Responsibilities:
 * - Multi-tenant isolated querying (companyId)
 * - Purchase Order Header & Lines management
 * - Automatic total cost calculation: line.totalCost = orderedQty * unitCost
 * - Status state machine persistence
 * - Optimistic concurrency validation (version)
 * ============================================================================
 */

import { BaseRepository } from "./base/base.repository";
import { CreatePurchaseOrderInput, PurchaseOrderQueryInput } from "@/types/purchasing.dto";
import { POStatus, Prisma } from "@prisma/client";

export class PurchaseOrderRepository extends BaseRepository {
  /**
   * Calculate line item totals and total aggregate order amount.
   */
  calculateTotals(lines: { orderedQty: number; unitCost: number }[]) {
    return lines.reduce(
      (sum, line) => sum + line.orderedQty * line.unitCost,
      0
    );
  }

  /**
   * Find paginated purchase orders with tenant isolation and status filters.
   */
  async findMany(companyId: string, query: Partial<PurchaseOrderQueryInput> = {}) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PurchaseOrderWhereInput = {
      companyId,
      deletedAt: null,
      ...(query.supplierId && { supplierId: query.supplierId }),
      ...(query.status && { status: query.status }),
      ...(query.search && {
        OR: [
          { poNumber: { contains: query.search, mode: "insensitive" } },
          { supplier: { name: { contains: query.search, mode: "insensitive" } } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          supplier: { select: { id: true, code: true, name: true, email: true } },
          lines: {
            include: {
              product: { select: { id: true, sku: true, title: true } },
            },
          },
          goodsReceipts: { select: { id: true, receiptNumber: true, receivedDate: true } },
        },
      }),
      this.prisma.purchaseOrder.count({ where }),
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
   * Resolve Purchase Order aggregate by ID with mandatory companyId tenant guard.
   */
  async findById(companyId: string, id: string) {
    return this.prisma.purchaseOrder.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        supplier: true,
        lines: {
          include: {
            product: true,
          },
        },
        goodsReceipts: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  /**
   * Create a new purchase order aggregate root with lines.
   */
  async create(companyId: string, data: CreatePurchaseOrderInput, userId?: string) {
    const poCount = await this.prisma.purchaseOrder.count({ where: { companyId } });
    const poNumber = `PO-${String(poCount + 1).padStart(5, "0")}`;
    const totalAmount = this.calculateTotals(data.lines);

    return this.prisma.purchaseOrder.create({
      data: {
        companyId,
        poNumber,
        supplierId: data.supplierId,
        totalAmount,
        status: POStatus.DRAFT,
        createdBy: userId,
        lines: {
          create: data.lines.map((line) => ({
            companyId,
            productId: line.productId,
            orderedQty: line.orderedQty,
            unitCost: line.unitCost,
            totalCost: line.orderedQty * line.unitCost,
          })),
        },
      },
      include: {
        supplier: true,
        lines: { include: { product: true } },
        goodsReceipts: true,
      },
    });
  }

  /**
   * Update purchase order lines and header with optimistic concurrency check.
   */
  async update(
    companyId: string,
    id: string,
    data: Partial<CreatePurchaseOrderInput> & { version?: number },
    userId?: string
  ) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.purchaseOrder.findFirst({
        where: { id, companyId, deletedAt: null },
        select: { version: true, status: true },
      });

      if (!existing) {
        throw new Error("Purchase Order not found or access denied");
      }

      if (data.version !== undefined && existing.version !== data.version) {
        throw new Error("Concurrency Conflict: Purchase Order updated by another transaction");
      }

      if (existing.status !== POStatus.DRAFT) {
        throw new Error(`Cannot modify Purchase Order lines in status '${existing.status}'`);
      }

      const updateData: Prisma.PurchaseOrderUpdateInput = {
        ...(data.supplierId && { supplierId: data.supplierId }),
        updatedBy: userId,
        version: { increment: 1 },
      };

      if (data.lines) {
        await tx.purchaseOrderLine.deleteMany({ where: { purchaseOrderId: id } });
        const totalAmount = this.calculateTotals(data.lines);
        updateData.totalAmount = totalAmount;
        updateData.lines = {
          create: data.lines.map((line) => ({
            companyId,
            productId: line.productId,
            orderedQty: line.orderedQty,
            unitCost: line.unitCost,
            totalCost: line.orderedQty * line.unitCost,
          })),
        };
      }

      return tx.purchaseOrder.update({
        where: { id },
        data: updateData,
        include: {
          supplier: true,
          lines: { include: { product: true } },
          goodsReceipts: true,
        },
      });
    });
  }

  /**
   * Update Purchase Order status.
   */
  async updateStatus(companyId: string, id: string, status: POStatus, userId?: string) {
    return this.prisma.purchaseOrder.updateMany({
      where: { id, companyId, deletedAt: null },
      data: {
        status,
        updatedBy: userId,
        version: { increment: 1 },
      },
    });
  }
}

export const purchaseOrderRepository = new PurchaseOrderRepository();
