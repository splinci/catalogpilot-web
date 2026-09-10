export interface UpdateProductDto {
  id: string;

  sku: string;
  name: string;
  description?: string;

  brandId?: string;
  categoryId?: string;
  supplierId?: string;

  barcode?: string;
  unit?: string;

  costPrice: number;
  sellingPrice: number;

  currentStock: number;
  minimumStock: number;

  status: "ACTIVE" | "INACTIVE";
}