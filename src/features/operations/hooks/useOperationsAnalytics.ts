/**
 * ============================================================================
 * Splinci Commerce OS — useOperationsAnalytics Hook
 * ============================================================================
 * Specification Reference: M12-004 / API-001 / UI-001
 * Consumes: /api/operations/dashboard, /api/operations/analytics,
 *           /api/operations/analytics/readiness, /api/operations/analytics/health
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";

export function useOperationsAnalytics() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [readiness, setReadiness] = useState<any>(null);
  const [healthSummary, setHealthSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, trendRes, readinessRes, healthRes] = await Promise.all([
        fetch("/api/operations/dashboard"),
        fetch("/api/operations/analytics"),
        fetch("/api/operations/analytics/readiness"),
        fetch("/api/operations/analytics/health"),
      ]);

      const [dashJson, trendJson, readinessJson, healthJson] = await Promise.all([
        dashRes.json(),
        trendRes.json(),
        readinessRes.json(),
        healthRes.json(),
      ]);

      if (dashJson.success) setDashboard(dashJson.data);
      if (trendJson.success) setTrends(trendJson.data);
      if (readinessJson.success) setReadiness(readinessJson.data);
      if (healthJson.success) setHealthSummary(healthJson.data);
    } catch (err: any) {
      setError(err?.message || "Failed to load operational analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return {
    dashboard,
    trends,
    readiness,
    healthSummary,
    loading,
    error,
    refresh: fetchAnalyticsData,
  };
}
