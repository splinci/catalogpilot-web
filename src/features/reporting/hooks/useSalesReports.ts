/**
 * ============================================================================
 * M10-004 — useSalesReports Hook
 * Consumes GET /api/reporting/sales
 * ============================================================================
 */
"use client";

import { useState, useEffect, useCallback } from "react";

export interface SalesFilters {
  startDate?: string;
  endDate?: string;
  customerId?: string;
  categoryId?: string;
  productId?: string;
  groupBy?: string;
}

export interface SalesData {
  summary: {
    totalRevenue: number;
    ordersCount: number;
    avgOrderValue: number;
    uniqueCustomers: number;
    unitsShipped: number;
  };
  topProducts: Array<{ productName: string; sku: string; unitsSold: number; revenue: number; margin: number }>;
  topCategories: Array<{ categoryName: string; ordersCount: number; revenue: number; share: number }>;
  topCustomers: Array<{ customerName: string; ordersCount: number; totalSpend: number; avgOrder: number }>;
  revenueTrend: Array<{ period: string; ordersCount: number; revenue: number; growth: number }>;
  salespersonPerformance: Array<{ name: string; ordersCount: number; revenue: number }>;
}

export interface UseSalesReportsResult {
  data: SalesData | null;
  loading: boolean;
  error: string | null;
  filters: SalesFilters;
  setFilters: (f: SalesFilters) => void;
  refetch: () => void;
}

export function useSalesReports(initialFilters?: SalesFilters): UseSalesReportsResult {
  const [filters, setFilters] = useState<SalesFilters>(initialFilters ?? {});
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const res = await fetch(`/api/reporting/sales?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Sales report fetch failed");
      setData(json.data);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, filters, setFilters, refetch };
}
