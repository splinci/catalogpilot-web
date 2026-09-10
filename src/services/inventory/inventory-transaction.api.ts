import type { AdjustStockDto } from "@/domains/inventory-transaction/dto/adjust-stock.dto";

export async function adjustStock(
  productId: string,
  data: AdjustStockDto
) {
  const response = await fetch(
    `/api/inventory/products/${productId}/adjust-stock`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.message ?? "Failed to adjust stock."
    );
  }

  return response.json();
}

export async function getProductHistory(
  productId: string
) {
  const response = await fetch(
    `/api/inventory/products/${productId}/transactions`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load inventory history."
    );
  }

  return response.json();
}