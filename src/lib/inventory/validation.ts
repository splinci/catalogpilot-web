import { z } from "zod";

export const ProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(2),

  description: z.string().optional(),

  category: z.string().optional(),
  brand: z.string().optional(),
  barcode: z.string().optional(),

  unit: z.string().min(1),

  costPrice: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0),

  currentStock: z.coerce.number().min(0),
  minimumStock: z.coerce.number().min(0),
});

export type ProductFormData = z.infer<typeof ProductSchema>;