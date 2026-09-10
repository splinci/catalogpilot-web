import { BulkProduct, ValidationResult } from "@/types/bulk";
import { PreviewProduct } from "@/types/preview";

export function buildPreviewProducts(
  products: BulkProduct[],
  validationResult: ValidationResult
): PreviewProduct[] {
  return validationResult.items.map((item) => {
    const product = products.find(
      (p) => p.sku === item.sku
    );

    if (!product) {
      throw new Error(
        `Product not found for SKU: ${item.sku}`
      );
    }

    return {
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      category: product.category,
      marketplace: product.marketplace,
      description: product.description,
      price: product.price,

      imageName: product.imageName,

      uploadedImage: item.uploadedImage,
      uploadedFile: item.uploadedFile,

      status: item.status,
    };
  });
}