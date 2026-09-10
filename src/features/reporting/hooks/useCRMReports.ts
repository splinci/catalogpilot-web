/**
 * ============================================================================
 * M10-004 — useCRMReports Hook
 * Consumes GET /api/reporting/crm
 * ============================================================================
 */
"use client";

import { useState, useEffect, useCallback } from "react";

export interface CRMData {
  growth: {
    totalCustomers: number;
    newCustomers: number;
    churned: number;
    growthRate: number;
    trend: Array<{ period: string; newCustomers: number; churned: number; net: number; total: number }>;
  };
  retention: {
    retentionRate: number;
    churnRate: number;
    bySegment: Array<{ segment: string; startCount: number; endCount: number; retained: number; rate: number }>;
  };
  ltv: {
    averageLTV: number;
    medianLTV: number;
    topCustomers: Array<{ customerName: string; ordersCount: number; totalRevenue: number; ltvScore: number }>;
  };
  segmentation: {
    vip: number;
    loyal: number;
    atRisk: number;
    churned: number;
    prospect: number;
    total: number;
  };
  creditRisk: {
    highRisk: Array<{ customerName: string; creditLimit: number; currentBalance: number; utilizationPct: number; riskLevel: string }>;
    totalExposure: number;
  };
}

export interface UseCRMReportsResult {
  data: CRMData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCRMReports(): UseCRMReportsResult {
  const [data, setData] = useState<CRMData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/reporting/crm", { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "CRM report fetch failed");
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
