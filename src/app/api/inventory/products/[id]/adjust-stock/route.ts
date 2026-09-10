import { NextRequest, NextResponse } from "next/server";

import { inventoryTransactionService } from "@/domains/inventory-transaction/services/inventory-transaction.service";
import { adjustStockSchema } from "@/domains/inventory-transaction/validators/adjust-stock.validator";

import { handleApiError } from "@/lib/api/handleApiError";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const requestBody = await request.json();

const body = adjustStockSchema.parse({
  ...requestBody,
  productId: id,
});

const result =
  await inventoryTransactionService.adjustStock(body);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}