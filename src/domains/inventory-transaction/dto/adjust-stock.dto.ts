import { InventoryTransactionType } from "@/generated/prisma/enums";

export interface AdjustStockDto {
  productId: string;

  quantity: number;

  type: InventoryTransactionType;

  reference?: string;

  remarks?: string;
}