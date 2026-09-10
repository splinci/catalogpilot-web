import { z } from "zod";

export const createProductSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(1, "SKU is required"),

  name: z
    .string()
    .trim()
    .min(1, "Product name is required"),

  description: z.string().optional(),

  category: z.string().optional(),

  brand: z.string().optional(),

  barcode: z.string().optional(),

  unit: z
    .string()
    .trim()
    .min(1, "Unit is required"),

  costPrice: z
    .number()
    .min(0, "Cost price must be greater than or equal to 0"),

  sellingPrice: z
    .number()
    .min(0, "Selling price must be greater than or equal to 0"),

  minimumStock: z
    .number()
    .int()
    .min(0, "Minimum stock must be greater than or equal to 0"),

  status: z
    .enum(["ACTIVE", "INACTIVE"])
    .optional(),
});

export type CreateProductInput =
  z.infer<typeof createProductSchema>;