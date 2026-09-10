export interface InventoryProduct {
  id: string;

  sku: string;
  name: string;
  description: string | null;

  categoryId: string | null;
  brandId: string | null;
  supplierId: string | null;

  // Display names
  category: string | null;
  brand: string | null;

  barcode: string | null;
  unit: string;

  costPrice: number;
  sellingPrice: number;

  currentStock: number;
  minimumStock: number;

  status: "ACTIVE" | "INACTIVE";

  createdAt: string;
  updatedAt: string;
}