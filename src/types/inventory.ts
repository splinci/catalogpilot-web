export type ProductStatus = "ACTIVE" | "INACTIVE";

export type InventoryTransactionType =
  | "PURCHASE"
  | "SALE"
  | "ADJUSTMENT_IN"
  | "ADJUSTMENT_OUT"
  | "RETURN"
  | "DAMAGE"
  | "TRANSFER";

export interface Product {
  id: string;

  sku: string;
  name: string;
  description?: string;

  category?: string;
  brand?: string;
  barcode?: string;

  unit: string;

  costPrice: number;
  sellingPrice: number;

  currentStock: number;
  minimumStock: number;

  status: ProductStatus;

  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: string;

  productId: string;

  type: InventoryTransactionType;

  quantity: number;

  beforeStock: number;
  afterStock: number;

  reference?: string;
  remarks?: string;

  createdBy?: string;

  createdAt: string;
}