/**
 * ============================================================================
 * Splinci Commerce OS — useOperationsMetrics Hook
 * ============================================================================
 * Specification Reference: M12-004 / API-001 / UI-001
 * Consumes: /api/operations/metrics, /api/operations/metrics/operational, /api/operations/metrics/queue, etc.
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { OperationsMetricsSummaryDto } from "@/types/operations.dto";

export function useOperationsMetrics() {
  const [metrics, setMetrics] = useState<OperationsMetricsSummaryDto | null>(null);
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetricsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, kpiRes] = await Promise.all([
        fetch("/api/operations/metrics"),
        fetch("/api/operations/metrics/operational"),
      ]);

      const [summaryJson, kpiJson] = await Promise.all([
        summaryRes.json(),
        kpiRes.json(),
      ]);

      if (summaryJson.success) setMetrics(summaryJson.data);
      if (kpiJson.success) setKpis(kpiJson.data);
    } catch (err: any) {
      setError(err?.message || "Failed to load operational metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetricsData();
  }, [fetchMetricsData]);

  return {
    metrics,
    kpis,
    loading,
    error,
    refresh: fetchMetricsData,
  };
}
