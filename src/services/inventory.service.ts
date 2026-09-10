import { inventoryRepository, InventoryRepository } from "@/repositories/inventory.repository";
import { warehouseRepository, WarehouseRepository } from "@/repositories/warehouse.repository";
import { auditService, AuditService } from "./audit.service";
import { StockAdjustmentInput, StockTransferInput, InventoryQueryInput } from "@/types/inventory.dto";
import { UserSessionPayload } from "@/types/auth.dto";
import { AuditAction, InventoryTransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class InventoryService {
  constructor(
    private inventoryRepo: InventoryRepository = inventoryRepository,
    private warehouseRepo: WarehouseRepository = warehouseRepository,
    private audit: AuditService = auditService
  ) {}

  async listInventory(session: UserSessionPayload, query: InventoryQueryInput) {
    return this.inventoryRepo.listItems(session.companyId, query);
  }

  async getInventoryStats(session: UserSessionPayload) {
    return this.inventoryRepo.getStats(session.companyId);
  }

  async listTransactions(session: UserSessionPayload, page = 1, limit = 20) {
    return this.inventoryRepo.listTransactions(session.companyId, page, limit);
  }

  async adjustStock(session: UserSessionPayload, input: StockAdjustmentInput) {
    const warehouse = await this.warehouseRepo.findById(session.companyId, input.warehouseId);
    if (!warehouse) {
      throw new Error("Warehouse not found or access denied");
    }

    const deltaOnHand = input.quantityDelta;
    const updatedItem = await this.inventoryRepo.updateStock(
      session.companyId,
      input.productId,
      input.warehouseId,
      deltaOnHand,
      0,
      input.transactionType,
      input.reference,
      session.userId
    );

    // Write Outbox Message
    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "INVENTORY_ADJUSTED",
        payload: {
          inventoryItemId: updatedItem.id,
          productId: input.productId,
          warehouseId: input.warehouseId,
          deltaOnHand,
          availableQty: updatedItem.availableQty,
          transactionType: input.transactionType,
          reference: input.reference,
        },
      },
    });

    // Check Low Stock Alert
    if (updatedItem.availableQty <= updatedItem.reorderLevel) {
      await prisma.outboxMessage.create({
        data: {
          companyId: session.companyId,
          eventType: "LOW_STOCK_DETECTED",
          payload: {
            productId: input.productId,
            sku: updatedItem.product.sku,
            warehouseId: input.warehouseId,
            availableQty: updatedItem.availableQty,
            reorderLevel: updatedItem.reorderLevel,
          },
        },
      });
    }

    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: AuditAction.STOCK_ADJUSTED,
      entityName: "InventoryItem",
      entityId: updatedItem.id,
      details: {
        sku: updatedItem.product.sku,
        warehouseCode: warehouse.code,
        deltaOnHand,
        availableQty: updatedItem.availableQty,
        transactionType: input.transactionType,
      },
    });

    return updatedItem;
  }

  async transferStock(session: UserSessionPayload, input: StockTransferInput) {
    if (input.sourceWarehouseId === input.targetWarehouseId) {
      throw new Error("Source and target warehouses must be different");
    }

    const [sourceWh, targetWh] = await Promise.all([
      this.warehouseRepo.findById(session.companyId, input.sourceWarehouseId),
      this.warehouseRepo.findById(session.companyId, input.targetWarehouseId),
    ]);

    if (!sourceWh || !targetWh) {
      throw new Error("Source or target warehouse not found");
    }

    return prisma.$transaction(async () => {
      // 1. Deduct from source warehouse
      const sourceItem = await this.inventoryRepo.updateStock(
        session.companyId,
        input.productId,
        input.sourceWarehouseId,
        -input.quantity,
        0,
        InventoryTransactionType.TRANSFER,
        `TRANSFER_OUT_TO_${targetWh.code}`,
        session.userId
      );

      // 2. Add to target warehouse
      const targetItem = await this.inventoryRepo.updateStock(
        session.companyId,
        input.productId,
        input.targetWarehouseId,
        input.quantity,
        0,
        InventoryTransactionType.TRANSFER,
        `TRANSFER_IN_FROM_${sourceWh.code}`,
        session.userId
      );

      await prisma.outboxMessage.create({
        data: {
          companyId: session.companyId,
          eventType: "INVENTORY_TRANSFERRED",
          payload: {
            productId: input.productId,
            sourceWarehouseId: input.sourceWarehouseId,
            targetWarehouseId: input.targetWarehouseId,
            quantity: input.quantity,
          },
        },
      });

      await this.audit.log({
        companyId: session.companyId,
        userId: session.userId,
        action: AuditAction.STOCK_ADJUSTED,
        entityName: "InventoryItem",
        entityId: sourceItem.id,
        details: {
          event: "STOCK_TRANSFER",
          sku: sourceItem.product.sku,
          from: sourceWh.code,
          to: targetWh.code,
          quantity: input.quantity,
        },
      });

      return {
        sourceItem,
        targetItem,
        transferredQty: input.quantity,
      };
    });
  }
}

export const inventoryService = new InventoryService();
