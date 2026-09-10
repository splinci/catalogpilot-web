import { Prisma } from "@/generated/prisma/client";
import { InventoryTransactionType } from "@/generated/prisma/enums";

type InventoryItem = {
  product: {
    id: string;
    name: string;
  };
  item: {
    quantity: number;
  };
};

async function adjustStock(
  tx: Prisma.TransactionClient,
  products: InventoryItem[],
  reference: string,
  type: InventoryTransactionType,
  operation: "INCREASE" | "DECREASE"
) {
  for (const { product, item } of products) {
    const currentProduct = await tx.product.findUnique({
      where: {
        id: product.id,
      },
      select: {
        id: true,
        currentStock: true,
      },
    });

    if (!currentProduct) {
      throw new Error(
        `Product ${product.id} not found.`
      );
    }

    if (
      operation === "DECREASE" &&
      currentProduct.currentStock < item.quantity
    ) {
      throw new Error(
        `Insufficient stock for ${product.name}.`
      );
    }

    const beforeStock = currentProduct.currentStock;

    const afterStock =
      operation === "DECREASE"
        ? beforeStock - item.quantity
        : beforeStock + item.quantity;

    await tx.product.update({
      where: {
        id: product.id,
      },
      data: {
        currentStock: afterStock,
      },
    });

    await tx.inventoryTransaction.create({
      data: {
        productId: product.id,
        type,
        quantity: item.quantity,
        beforeStock,
        afterStock,
        reference,
      },
    });
  }
}

export const inventoryService = {
  async decreaseStock(
    tx: Prisma.TransactionClient,
    products: InventoryItem[],
    reference: string
  ) {
    return adjustStock(
      tx,
      products,
      reference,
      InventoryTransactionType.SALE,
      "DECREASE"
    );
  },

  async increaseStock(
    tx: Prisma.TransactionClient,
    products: InventoryItem[],
    reference: string
  ) {
    return adjustStock(
      tx,
      products,
      reference,
      InventoryTransactionType.RETURN,
      "INCREASE"
    );
  },
};