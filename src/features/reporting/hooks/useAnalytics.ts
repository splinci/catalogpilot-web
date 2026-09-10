/**
 * ============================================================================
 * M10-004 — useAnalytics Hook
 * Consumes GET /api/reporting/analytics
 * ============================================================================
 */
"use client";

import { useState, useEffect, useCallback } from "react";

export interface AnalyticsData {
  growth: {
    revenueGrowthRate: number;
    orderGrowthRate: number;
    customerGrowthRate: number;
    currentRevenue: number;
    priorRevenue: number;
    revenueVariance: number;
  };
  trends: {
    movingAvgRevenue: number;
    movingAvgOrders: number;
    revenueDirection: string;
    seasonalityIndex: number;
    series: Array<{ period: string; revenue: number; movingAvg: number }>;
  };
  benchmarks: {
    grossMargin: { actual: number; benchmark: number };
    inventoryTurnover: { actual: number; benchmark: number };
    dso: { actual: number; benchmark: number };
  };
  health: {
    overallScore: number;
    rating: string;
    dimensions: {
      revenueMomentum: string | number;
      profitability: string | number;
      liquidity: string | number;
      efficiency: string | number;
      customerHealth: string | number;
    };
  };
}

export interface UseAnalyticsResult {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAnalytics(): UseAnalyticsResult {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/reporting/analytics", { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Analytics fetch failed");
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
