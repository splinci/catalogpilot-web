import { NextResponse } from "next/server";

import { inventoryTransactionService } from "@/domains/inventory-transaction/services/inventory-transaction.service";
import { handleApiError } from "@/lib/api/handleApiError";

export async function GET() {
  try {
    const transactions =
      await inventoryTransactionService.getAllTransactions();

    return NextResponse.json(transactions);
  } catch (error) {
    return handleApiError(error);
  }
}