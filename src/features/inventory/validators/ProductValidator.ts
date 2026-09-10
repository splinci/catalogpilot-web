import { z } from "zod";

export const createProductSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required."),
  name: z.string().trim().min(1, "Product name is required."),
  description: z.string().optional().default(""),

  categoryId: z.string().trim().min(1, "Category is required."),
  brandId: z.string().trim().min(1, "Brand is required."),

  barcode: z.string().optional().default(""),
  unit: z.string().trim().min(1, "Unit is required."),

  costPrice: z.number().min(0, "Cost price cannot be negative."),
  sellingPrice: z.number().min(0, "Selling price cannot be negative."),
  minimumStock: z.number().min(0, "Minimum stock cannot be negative."),
});

export const updateProductSchema =
  createProductSchema.partial();

export type CreateProductInput =
  z.infer<typeof createProductSchema>;

export type UpdateProductInput =
  z.infer<typeof updateProductSchema>;