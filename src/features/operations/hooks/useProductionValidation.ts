/**
 * ============================================================================
 * Splinci Commerce OS — Production Validation Custom React Hook
 * ============================================================================
 * Specification Reference: CI-007 / HOOK-001 / UI-001 / ENG-001
 * Custom Hook for Fetching & Exercising Production Validation Scenarios
 * Note: 100% REST API consumption — 0 Prisma, 0 Repositories, 0 Services.
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { ValidationDashboardDto, ValidationEvidenceDto } from "../../../types/operations-validation.dto";

export function useProductionValidation() {
  const [data, setData] = useState<ValidationDashboardDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/operations/validation/dashboard");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch production validation dashboard");
      }
      setData(json.data);
    } catch (err: any) {
      setError(err?.message || "An error occurred while loading validation metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  const runValidation = useCallback(async (scenarioId: string): Promise<ValidationEvidenceDto | null> => {
    try {
      const res = await fetch(`/api/operations/validation/scenarios/${scenarioId}/run`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Failed to execute validation scenario ${scenarioId}`);
      }
      await fetchDashboard();
      return json.data;
    } catch (err: any) {
      setError(err?.message || "Validation execution failed");
      return null;
    }
  }, [fetchDashboard]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
    runValidation,
  };
}
