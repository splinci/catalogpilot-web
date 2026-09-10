import { InventoryTransactionType } from "@/generated/prisma/enums";

export interface InventoryTransactionModel {
  id: string;

  productId: string;

  type: InventoryTransactionType;

  quantity: number;

  beforeStock: number;
  afterStock: number;

  reference?: string | null;
  remarks?: string | null;

  createdBy?: string | null;

  createdAt: Date;
}