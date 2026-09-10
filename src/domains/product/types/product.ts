import type { Brand } from "@/domains/brand/types/brand";
import type { Category } from "@/domains/category/types/category";
import type { Supplier } from "@/domains/supplier/types/supplier";

export interface Product {
  id: string;

  sku: string;
  name: string;
  description?: string | null;

  barcode?: string | null;
  unit?: string | null;

  brandId?: string | null;
  categoryId?: string | null;
  supplierId?: string | null;

  brand?: Brand | null;
  category?: Category | null;
  supplier?: Supplier | null;

  costPrice: number;
  sellingPrice: number;

  currentStock: number;
  minimumStock: number;

  status: "ACTIVE" | "INACTIVE";

  createdAt: string;
  updatedAt: string;
}