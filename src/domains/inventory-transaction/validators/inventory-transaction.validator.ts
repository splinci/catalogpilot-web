import { z } from "zod";

import { InventoryTransactionType } from "@/generated/prisma/enums";

export const createInventoryTransactionSchema = z.object({
  productId: z.string().min(1),

  type: z.nativeEnum(InventoryTransactionType),

  quantity: z.number().int().positive(),

  beforeStock: z.number().int().min(0),

  afterStock: z.number().int().min(0),

  reference: z.string().optional(),

  remarks: z.string().optional(),

  createdBy: z.string().optional(),
});

export type CreateInventoryTransactionInput =
  z.infer<typeof createInventoryTransactionSchema>;