import { z } from "zod";

export const updateProductSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(1)
    .optional(),

  name: z
    .string()
    .trim()
    .min(1)
    .optional(),

  description: z.string().optional(),

  category: z.string().optional(),

  brand: z.string().optional(),

  barcode: z.string().optional(),

  unit: z
    .string()
    .trim()
    .min(1)
    .optional(),

  costPrice: z
    .number()
    .min(0)
    .optional(),

  sellingPrice: z
    .number()
    .min(0)
    .optional(),

  minimumStock: z
    .number()
    .int()
    .min(0)
    .optional(),

  status: z
    .enum(["ACTIVE", "INACTIVE"])
    .optional(),
});

export type UpdateProductInput =
  z.infer<typeof updateProductSchema>;