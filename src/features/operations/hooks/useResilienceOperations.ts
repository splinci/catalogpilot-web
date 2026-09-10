/**
 * ============================================================================
 * Splinci Commerce OS — Production Resilience Custom React Hook
 * ============================================================================
 * Specification Reference: CI-006 / HOOK-001 / UI-001 / ENG-001
 * Custom Hook for Fetching Production Resilience & DR Intelligence Data
 * Note: 100% REST API consumption — 0 Prisma, 0 Repositories, 0 Services.
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { ResilienceDashboardDto } from "../../../types/operations-resilience.dto";

export function useResilienceOperations() {
  const [data, setData] = useState<ResilienceDashboardDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/operations/resilience/dashboard");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch resilience operations dashboard");
      }
      setData(json.data);
    } catch (err: any) {
      setError(err?.message || "An error occurred while loading resilience telemetry");
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
