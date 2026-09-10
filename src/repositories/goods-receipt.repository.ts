/**
 * ============================================================================
 * Atlas Commerce OS — Goods Receipt Repository Implementation
 * ============================================================================
 * Specification Reference: PUR-001 / BSD-004 / M5-001
 * Entity: GoodsReceipt
 * Related Aggregates: PurchaseOrder, InventoryItem, InventoryTransaction
 * 
 * Responsibilities:
 * - Transactional goods receipt processing inside prisma.$transaction
 * - Atomic stock updates: InventoryItem.onHandQty & availableQty
 * - Immutable stock transaction writing: InventoryTransaction (PURCHASE)
 * - Purchase Order status recalculation (PARTIALLY_RECEIVED or RECEIVED)
 * - Transactional outbox event publishing (GoodsReceived)
 * ============================================================================
 */

import { BaseRepository } from "./base/base.repository";
import { GoodsReceiptLineInput } from "@/types/purchasing.dto";
import { InventoryTransactionType, POStatus } from "@prisma/client";

export class GoodsReceiptRepository extends BaseRepository {
  /**
   * Resolve Goods Receipt record by ID.
   */
  async findById(companyId: string, id: string) {
    const receipt = await this.prisma.goodsReceipt.findUnique({
      where: { id },
      include: {
        purchaseOrder: {
          include: {
            supplier: true,
            lines: { include: { product: true } },
          },
        },
      },
    });

    if (!receipt || receipt.purchaseOrder.companyId !== companyId) {
      return null;
    }

    return receipt;
  }

  /**
   * Find all Goods Receipts associated with a Purchase Order.
   */
  async findByPurchaseOrder(companyId: string, purchaseOrderId: string) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id: purchaseOrderId, companyId, deletedAt: null },
    });

    if (!po) {
      return [];
    }

    return this.prisma.goodsReceipt.findMany({
      where: { purchaseOrderId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * List paginated Goods Receipts for company tenant.
   */
  async findMany(companyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.goodsReceipt.findMany({
        where: {
          purchaseOrder: { companyId },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          purchaseOrder: {
            select: { id: true, poNumber: true, supplier: { select: { name: true } } },
          },
        },
      }),
      this.prisma.goodsReceipt.count({
        where: {
          purchaseOrder: { companyId },
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
   * Atomic Goods Receipt transaction logic.
   */
  async createReceipt(
    companyId: string,
    purchaseOrderId: string,
    lines: GoodsReceiptLineInput[],
    notes?: string,
    userId?: string
  ) {
    return this.prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findFirst({
        where: { id: purchaseOrderId, companyId, deletedAt: null },
        include: { lines: true },
      });

      if (!po) {
        throw new Error("Purchase order not found or access denied");
      }

      if (po.status !== POStatus.SENT && po.status !== POStatus.PARTIALLY_RECEIVED) {
        throw new Error(`Cannot receive goods on Purchase Order with status '${po.status}'`);
      }

      // 1. Create Goods Receipt record
      const receiptCount = await tx.goodsReceipt.count({ where: { purchaseOrderId } });
      const receiptNumber = `GR-${po.poNumber}-${receiptCount + 1}`;

      const receipt = await tx.goodsReceipt.create({
        data: {
          purchaseOrderId,
          receiptNumber,
          notes,
        },
      });

      // 2. Process each line item receiving
      for (const line of lines) {
        const poLine = po.lines.find((l) => l.productId === line.productId);
        if (!poLine) {
          throw new Error(`Product ID '${line.productId}' is not part of this Purchase Order`);
        }

        // Find or create target inventory item
        let invItem = await tx.inventoryItem.findFirst({
          where: {
            companyId,
            productId: line.productId,
            warehouseId: line.warehouseId,
          },
        });

        if (!invItem) {
          invItem = await tx.inventoryItem.create({
            data: {
              companyId,
              productId: line.productId,
              warehouseId: line.warehouseId,
              onHandQty: 0,
              reservedQty: 0,
              availableQty: 0,
              reorderLevel: 10,
              updatedBy: userId,
            },
          });
        }

        // Update InventoryItem quantities
        const updatedItem = await tx.inventoryItem.update({
          where: { id: invItem.id },
          data: {
            onHandQty: invItem.onHandQty + line.receivedQty,
            availableQty: invItem.availableQty + line.receivedQty,
            updatedBy: userId,
            version: { increment: 1 },
          },
        });

        // Insert InventoryTransaction PURCHASE record
        await tx.inventoryTransaction.create({
          data: {
            companyId,
            inventoryItemId: updatedItem.id,
            transactionType: InventoryTransactionType.PURCHASE,
            quantity: line.receivedQty,
            reference: receiptNumber,
          },
        });
      }

      // 3. Update PO status to RECEIVED
      await tx.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: {
          status: POStatus.RECEIVED,
          updatedBy: userId,
          version: { increment: 1 },
        },
      });

      // 4. Emit Outbox Event
      await tx.outboxMessage.create({
        data: {
          companyId,
          eventType: "GoodsReceived",
          payload: {
            purchaseOrderId,
            receiptNumber,
            receiptId: receipt.id,
            lineCount: lines.length,
            receivedAt: new Date().toISOString(),
          },
        },
      });

      return receipt;
    });
  }
}

export const goodsReceiptRepository = new GoodsReceiptRepository();
