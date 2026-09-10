import type { Prisma } from "@prisma/client";
import type { ProductDto } from "../dto/product.dto";

type ProductWithCategory = Prisma.ProductGetPayload<{
  include: {
    category: true;
    brand: true;
  };
}>;

export function toProductDto(
  product: ProductWithCategory
): ProductDto {
  return {
    id: product.id,
    sku: product.sku,
    name: product.title,
    description: product.description,
    categoryId: product.categoryId,
    category: product.category?.name ?? null,
    brand: product.brand?.name ?? null,
    barcode: null,
    unit: "EA",
    costPrice: Number(product.costPrice),
    sellingPrice: Number(product.price),
    currentStock: 100,
    minimumStock: 10,
    status: product.status as any,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}