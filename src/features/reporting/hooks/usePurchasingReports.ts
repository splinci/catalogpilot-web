/**
 * ============================================================================
 * M10-004 — usePurchasingReports Hook
 * Consumes GET /api/reporting/purchasing
 * ============================================================================
 */
"use client";

import { useState, useEffect, useCallback } from "react";

export interface PurchasingData {
  supplierScorecards: Array<{
    supplierId: string;
    supplierName: string;
    totalOrders: number;
    onTimeDeliveryRate: number;
    avgLeadTimeDays: number;
    qualityScore: number;
    totalSpend: number;
  }>;
  spend: { totalSpend: number; activeSuppliers: number; avgOrderValue: number };
  spendBySupplier: Array<{ supplierName: string; poCount: number; totalSpend: number; sharePercent: number }>;
  spendTrend: Array<{ period: string; spend: number; poCount: number }>;
  leadTimes: { avgLeadTimeDays: number; minLeadTime: number; maxLeadTime: number; bySupplier: Array<{ supplierName: string; avgDays: number }> };
  receivingPerformance: {
    onTimeRate: number;
    totalReceipts: number;
    bySupplier: Array<{ supplierName: string; totalReceipts: number; onTime: number; late: number; accuracyRate: number }>;
  };
}

export interface UsePurchasingReportsResult {
  data: PurchasingData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePurchasingReports(): UsePurchasingReportsResult {
  const [data, setData] = useState<PurchasingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/reporting/purchasing", { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Purchasing report fetch failed");
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
