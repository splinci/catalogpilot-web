import { PreviewProduct } from "@/types/preview";

export interface CatalogResponse {
  title: string;
  description: string;
  features: string[];
  specifications: string[];
  seoKeywords: string[];
}

/* One generated product */

export interface GeneratedCatalog {
  product: PreviewProduct;
  catalog: CatalogResponse;
}

/* Progress updates */

export interface BulkGenerationProgress {
  current: number;
  total: number;
  percentage: number;
  productName: string;
}

/* Final result */

export interface BulkGenerationResult {
  success: GeneratedCatalog[];
  failed: PreviewProduct[];
}