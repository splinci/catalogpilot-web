import { prisma } from "@/lib/prisma";
import { Prisma, InventoryTransactionType } from "@prisma/client";
import { InventoryQueryInput, InventoryStats } from "@/types/inventory.dto";

export class InventoryRepository {
  async findItem(companyId: string, productId: string, warehouseId: string) {
    return prisma.inventoryItem.findFirst({
      where: {
        companyId,
        productId,
        warehouseId,
      },
      include: {
        product: true,
        warehouse: true,
      },
    });
  }

  async listItems(companyId: string, query: InventoryQueryInput) {
    const { page, limit, search, warehouseId, lowStockOnly } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryItemWhereInput = {
      companyId,
      ...(warehouseId && { warehouseId }),
      ...(search && {
        product: {
          OR: [
            { sku: { contains: search, mode: "insensitive" } },
            { title: { contains: search, mode: "insensitive" } },
          ],
        },
      }),
    };

    if (lowStockOnly) {
      where.availableQty = { lte: prisma.inventoryItem.fields.reorderLevel };
    }

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          product: {
            select: {
              id: true,
              sku: true,
              title: true,
              price: true,
              category: { select: { name: true } },
              brand: { select: { name: true } },
            },
          },
          warehouse: {
            select: { id: true, code: true, name: true },
          },
        },
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStats(companyId: string): Promise<InventoryStats> {
    const aggregate = await prisma.inventoryItem.aggregate({
      where: { companyId },
      _sum: {
        onHandQty: true,
        reservedQty: true,
        availableQty: true,
      },
      _count: {
        id: true,
      },
    });

    const items = await prisma.inventoryItem.findMany({
      where: { companyId },
      select: { availableQty: true, reorderLevel: true },
    });

    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const item of items) {
      if (item.availableQty <= 0) {
        outOfStockCount++;
      } else if (item.availableQty <= item.reorderLevel) {
        lowStockCount++;
      }
    }

    return {
      totalItems: aggregate._count.id || 0,
      totalOnHandQty: aggregate._sum.onHandQty || 0,
      totalReservedQty: aggregate._sum.reservedQty || 0,
      totalAvailableQty: aggregate._sum.availableQty || 0,
      lowStockCount,
      outOfStockCount,
    };
  }

  async updateStock(
    companyId: string,
    productId: string,
    warehouseId: string,
    deltaOnHand: number,
    deltaReserved: number,
    transactionType: InventoryTransactionType,
    reference?: string,
    userId?: string
  ) {
    return prisma.$transaction(async (tx) => {
      let item = await tx.inventoryItem.findFirst({
        where: { companyId, productId, warehouseId },
      });

      if (!item) {
        if (deltaOnHand < 0 || deltaReserved < 0) {
          throw new Error("Cannot decrease stock for non-existent inventory item");
        }
        item = await tx.inventoryItem.create({
          data: {
            companyId,
            productId,
            warehouseId,
            onHandQty: 0,
            reservedQty: 0,
            availableQty: 0,
            reorderLevel: 10,
            updatedBy: userId,
          },
        });
      }

      const newOnHand = item.onHandQty + deltaOnHand;
      const newReserved = item.reservedQty + deltaReserved;
      const newAvailable = newOnHand - newReserved;

      if (newOnHand < 0) {
        throw new Error(`Insufficient on-hand stock (${item.onHandQty} available, requested reduction of ${Math.abs(deltaOnHand)})`);
      }

      if (newReserved < 0) {
        throw new Error(`Invalid reserved stock calculation (Current: ${item.reservedQty}, Reduction: ${Math.abs(deltaReserved)})`);
      }

      if (newAvailable < 0) {
        throw new Error(`Insufficient available stock (${item.availableQty} available, attempt violates no-negative stock rule)`);
      }

      const updatedItem = await tx.inventoryItem.update({
        where: { id: item.id },
        data: {
          onHandQty: newOnHand,
          reservedQty: newReserved,
          availableQty: newAvailable,
          updatedBy: userId,
          version: { increment: 1 },
        },
        include: {
          product: true,
          warehouse: true,
        },
      });

      if (deltaOnHand !== 0) {
        await tx.inventoryTransaction.create({
          data: {
            companyId,
            inventoryItemId: updatedItem.id,
            transactionType,
            quantity: deltaOnHand,
            reference,
          },
        });
      }

      return updatedItem;
    });
  }

  async transferStock(
    companyId: string,
    productId: string,
    sourceWarehouseId: string,
    targetWarehouseId: string,
    quantity: number,
    userId?: string
  ) {
    if (quantity <= 0) {
      throw new Error("Transfer quantity must be positive");
    }
    if (sourceWarehouseId === targetWarehouseId) {
      throw new Error("Source and destination warehouses cannot be the same");
    }

    return prisma.$transaction(async (tx) => {
      const sourceItem = await tx.inventoryItem.findFirst({
        where: { companyId, productId, warehouseId: sourceWarehouseId },
      });

      if (!sourceItem || sourceItem.availableQty < quantity) {
        throw new Error(
          `Insufficient available inventory at source warehouse (Available: ${sourceItem?.availableQty || 0}, Requested: ${quantity})`
        );
      }

      const updatedSource = await tx.inventoryItem.update({
        where: { id: sourceItem.id },
        data: {
          onHandQty: sourceItem.onHandQty - quantity,
          availableQty: sourceItem.availableQty - quantity,
          version: { increment: 1 },
          updatedBy: userId,
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          companyId,
          inventoryItemId: sourceItem.id,
          transactionType: InventoryTransactionType.TRANSFER,
          quantity: -quantity,
          reference: `TRANSFER_OUT_TO_${targetWarehouseId}`,
        },
      });

      let targetItem = await tx.inventoryItem.findFirst({
        where: { companyId, productId, warehouseId: targetWarehouseId },
      });

      if (!targetItem) {
        targetItem = await tx.inventoryItem.create({
          data: {
            companyId,
            productId,
            warehouseId: targetWarehouseId,
            onHandQty: 0,
            reservedQty: 0,
            availableQty: 0,
            reorderLevel: 10,
            updatedBy: userId,
          },
        });
      }

      const updatedTarget = await tx.inventoryItem.update({
        where: { id: targetItem.id },
        data: {
          onHandQty: targetItem.onHandQty + quantity,
          availableQty: targetItem.availableQty + quantity,
          version: { increment: 1 },
          updatedBy: userId,
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          companyId,
          inventoryItemId: targetItem.id,
          transactionType: InventoryTransactionType.TRANSFER,
          quantity: quantity,
          reference: `TRANSFER_IN_FROM_${sourceWarehouseId}`,
        },
      });

      return { source: updatedSource, target: updatedTarget };
    });
  }

  async listTransactions(companyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: Prisma.InventoryTransactionWhereInput = { companyId };

    const [items, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          inventoryItem: {
            include: {
              product: { select: { sku: true, title: true } },
              warehouse: { select: { code: true, name: true } },
            },
          },
        },
      }),
      prisma.inventoryTransaction.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const inventoryRepository = new InventoryRepository();
