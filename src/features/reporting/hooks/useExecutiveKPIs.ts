/**
 * ============================================================================
 * M10-004 — useExecutiveKPIs Hook
 * Consumes GET /api/reporting/executive
 * ============================================================================
 */
"use client";

import { useState, useEffect, useCallback } from "react";

export interface ExecutiveKPIData {
  healthScore: { score: number; rating: string; dimensions: Record<string, string | number> };
  revenue: { total: number; growth: number; grossProfit: number; grossMargin: number };
  inventory: { value: number; turnover: number; reorderCount: number };
  purchasing: { spend: number; onTimeRate: number; avgLeadTime: number };
  finance: { receivables: number; collectionRate: number; dso: number };
  crm: { totalCustomers: number; newCustomers: number; avgLTV: number; retentionRate: number };
  ai: { jobsRun: number; enrichmentRate: number; classificationAccuracy: number };
  ordersCount: number;
  deliveredCount: number;
  customersCount: number;
  aiJobsRun: number;
}

export interface UseExecutiveKPIsResult {
  data: ExecutiveKPIData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useExecutiveKPIs(): UseExecutiveKPIsResult {
  const [data, setData] = useState<ExecutiveKPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/reporting/executive", { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Executive KPI fetch failed");
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
