export interface CreateProductDto {
  sku: string;
  name: string;

  description?: string;

  brandId?: string;
  categoryId?: string;
  supplierId?: string;

  barcode?: string;
  unit: string;

  costPrice: number;
  sellingPrice: number;

  minimumStock?: number;
}