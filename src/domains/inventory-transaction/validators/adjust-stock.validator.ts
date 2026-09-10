import { z } from "zod";

export const adjustStockSchema = z.object({
  productId: z.string().min(1),

  quantity: z.number().int().positive(),

  type: z.enum([
    "PURCHASE",
    "SALE",
    "ADJUSTMENT_IN",
    "ADJUSTMENT_OUT",
    "RETURN",
    "DAMAGE",
    "TRANSFER",
  ]),

  reference: z.string().optional(),

  remarks: z.string().optional(),
});