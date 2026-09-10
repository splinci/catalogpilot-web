import { prisma } from "@/lib/prisma";

import type {
  CreateInventoryTransactionDto,
} from "@/domains/inventory-transaction/dto/inventory-transaction.dto";

export const inventoryTransactionRepository = {
  async create(data: CreateInventoryTransactionDto) {
    return prisma.inventoryTransaction.create({
      data: {
        companyId: (data as any).companyId || "cmp_atlas_01",
        inventoryItemId: (data as any).inventoryItemId || (data as any).productId || "inv_1",
        transactionType: (data as any).transactionType || "ADJUSTMENT_IN",
        quantity: data.quantity || 0,
        reference: (data as any).reference || null,
      },
    });
  },

  async findByProduct(productId: string) {
    return prisma.inventoryTransaction.findMany({
      where: {
        inventoryItemId: productId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async findRecent(limit = 20) {
    return prisma.inventoryTransaction.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        inventoryItem: {
          include: {
            product: true,
          },
        },
      },
    });
  },

  async findAll() {
    return prisma.inventoryTransaction.findMany({
      include: {
        inventoryItem: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
};