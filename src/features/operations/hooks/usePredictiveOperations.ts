/**
 * ============================================================================
 * Splinci Commerce OS — Predictive Operations Custom React Hook
 * ============================================================================
 * Specification Reference: CI-005 / HOOK-001 / UI-001 / ENG-001
 * Custom Hook for Fetching Predictive Operations & Capacity Planning Data
 * Note: 100% REST API consumption — 0 Prisma, 0 Repositories, 0 Services.
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { PredictiveOperationsDashboardDto } from "../../../types/operations-predictive.dto";

export function usePredictiveOperations() {
  const [data, setData] = useState<PredictiveOperationsDashboardDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/operations/predictive/dashboard");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch predictive operations dashboard");
      }
      setData(json.data);
    } catch (err: any) {
      setError(err?.message || "An error occurred while loading predictive telemetry");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
  };
}
