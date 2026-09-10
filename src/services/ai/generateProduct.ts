import { PreviewProduct } from "@/types/preview";
import {
  CatalogResponse,
  GeneratedCatalog,
} from "./types";

export async function generateProduct(
  product: PreviewProduct
): Promise<GeneratedCatalog> {
  const response = await fetch("/api/generate", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      product,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate catalog.");
  }

  const data: {
    success: boolean;
    catalog: CatalogResponse;
  } = await response.json();

  return {
    product,
    catalog: data.catalog,
  };
}