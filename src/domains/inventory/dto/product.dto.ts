import type { ProductStatus } from "@/generated/prisma/enums";

export interface ProductDto {
  id: string;

  sku: string;
  name: string;

  description: string | null;

  categoryId: string | null;

  // Display name
  category: string | null;
  brand: string | null;
  barcode: string | null;

  unit: string | null;

  costPrice: number;
  sellingPrice: number;

  currentStock: number;
  minimumStock: number;

  status: ProductStatus;

  createdAt: Date;
  updatedAt: Date;
}