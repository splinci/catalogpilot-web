import { InventoryTransactionType } from "@/generated/prisma/enums";

export interface CreateInventoryTransactionDto {
  productId: string;

  type: InventoryTransactionType;

  quantity: number;

  beforeStock: number;
  afterStock: number;

  reference?: string;

  remarks?: string;

  createdBy?: string;
}