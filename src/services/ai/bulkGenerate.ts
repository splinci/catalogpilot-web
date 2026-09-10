import { PreviewProduct } from "@/types/preview";

import {
  BulkGenerationProgress,
  BulkGenerationResult,
} from "./types";

import { generateProduct } from "./generateProduct";

export async function bulkGenerate(
  products: PreviewProduct[],
  onProgress?: (
    progress: BulkGenerationProgress
  ) => void
): Promise<BulkGenerationResult> {
  const success = [];
  const failed = [];

  for (let index = 0; index < products.length; index++) {
    const product = products[index];

    try {
      const catalog = await generateProduct(product);

      success.push(catalog);
    } catch (error) {
      console.error(
        `Failed to generate ${product.name}`,
        error
      );

      failed.push(product);
    }

    onProgress?.({
      current: index + 1,
      total: products.length,
      percentage: Math.round(
        ((index + 1) / products.length) * 100
      ),
      productName: product.name,
    });
  }

  return {
    success,
    failed,
  };
}