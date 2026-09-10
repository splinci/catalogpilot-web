/**
 * ============================================================================
 * M10-004 — useDashboard Hook
 * Consumes GET /api/reporting/dashboard
 * ============================================================================
 */
"use client";

import { useState, useEffect, useCallback } from "react";

export interface ExecutiveDashboardData {
  summary: {
    totalRevenue: number;
    grossProfit: number;
    grossMargin: number;
    totalOrdersCount: number;
    receivables: number;
    inventoryValue: number;
    purchaseSpend: number;
    customersCount: number;
    aiJobsRun: number;
  };
  trends: Array<{ period: string; revenue: number; orders: number; customers: number }>;
  crossModuleKPIs: Record<string, number | string>;
}

export interface UseDashboardResult {
  data: ExecutiveDashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboard(): UseDashboardResult {
  const [data, setData] = useState<ExecutiveDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/reporting/dashboard", { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Dashboard fetch failed");
      setData(json.data);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}
