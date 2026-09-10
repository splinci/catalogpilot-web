"use client";

import { useQuery } from "@tanstack/react-query";

import { getInventoryStats } from "@/services/inventory/stats.api";

export function useInventoryStats() {
  const statsQuery = useQuery({
    queryKey: ["inventory-stats"],
    queryFn: getInventoryStats,
  });

  return {
    stats: statsQuery.data,
    loading: statsQuery.isPending,
    error: statsQuery.error,
    refresh: statsQuery.refetch,
  };
}