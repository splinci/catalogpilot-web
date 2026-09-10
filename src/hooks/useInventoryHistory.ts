"use client";

import { useQuery } from "@tanstack/react-query";

import { getInventoryHistory } from "@/services/inventory/inventory-history.api";
import type { InventoryHistoryItem } from "@/features/inventory-history/types/inventory-history";

export function useInventoryHistory() {
  const query = useQuery({
    queryKey: ["inventory-history"],
    queryFn: getInventoryHistory,
  });

  return {
    transactions:
  (query.data ?? []) as InventoryHistoryItem[],
    loading: query.isPending,
    error: query.error,
    refresh: query.refetch,
  };
}