/**
 * ============================================================================
 * M10-004 — useFinanceReports Hook
 * Consumes GET /api/reporting/finance
 * ============================================================================
 */
"use client";

import { useState, useEffect, useCallback } from "react";

export interface FinanceData {
  revenue: { totalRevenue: number; revenueByPeriod: Array<{ period: string; revenue: number }> };
  receivables: {
    totalOutstanding: number;
    topOutstanding: Array<{ customerName: string; invoiceNumber: string; amount: number; dueDate: string; status: string }>;
  };
  aging: {
    current: { amount: number; count: number };
    days31_60: { amount: number; count: number };
    days61_90: { amount: number; count: number };
    days91_120: { amount: number; count: number };
    over120: { amount: number; count: number };
  };
  payments: {
    totalCollected: number;
    recent: Array<{ customerName: string; amount: number; paidAt: string; method: string; invoiceNumber: string }>;
  };
  collections: { collectionRate: number; avgDaysToCollect: number; totalCollected: number };
  profitability: { grossProfit: number; grossMarginPercent: number; netProfit: number; netMarginPercent: number };
}

export interface UseFinanceReportsResult {
  data: FinanceData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFinanceReports(): UseFinanceReportsResult {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/reporting/finance", { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Finance report fetch failed");
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
