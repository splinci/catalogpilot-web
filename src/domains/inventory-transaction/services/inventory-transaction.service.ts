import { prisma } from "@/lib/prisma";
import { inventoryTransactionRepository } from "../repositories/inventory-transaction.repository";
import type { AdjustStockDto } from "../dto/adjust-stock.dto";

export class InventoryTransactionService {
  async adjustStock(dto: AdjustStockDto) {
    const product = await prisma.product.findUnique({
      where: {
        id: dto.productId,
      },
    });

    if (!product) {
      throw new Error("Product not found.");
    }

    const previousStock = (product as any).currentStock ?? 100;
    let newStock = previousStock;

    switch (dto.type) {
      case "PURCHASE":
      case "RETURN":
      case "ADJUSTMENT_IN":
        newStock += dto.quantity;
        break;
    
      case "SALE":
      case "DAMAGE":
      case "TRANSFER":
      case "ADJUSTMENT_OUT":
        if (previousStock < dto.quantity) {
          throw new Error("Insufficient stock.");
        }
        newStock -= dto.quantity;
        break;
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: {
          id: dto.productId,
        },
        data: {
          updatedAt: new Date(),
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          companyId: product.companyId,
          inventoryItemId: dto.productId,
          transactionType: (dto.type as any) || "ADJUSTMENT_IN",
          quantity: dto.quantity,
          reference: dto.reference || null,
        },
      });
    });

    return {
      previousStock,
      newStock,
    };
  }

  async getProductHistory(productId: string) {
    return inventoryTransactionRepository.findByProduct(productId);
  }

  async getRecentTransactions(limit = 20) {
    return inventoryTransactionRepository.findRecent(limit);
  }

  async getAllTransactions() {
    return inventoryTransactionRepository.findAll();
  }
}

export const inventoryTransactionService = new InventoryTransactionService();