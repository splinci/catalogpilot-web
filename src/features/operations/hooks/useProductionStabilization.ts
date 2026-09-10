/**
 * ============================================================================
 * Splinci Commerce OS — Production Stabilization Custom React Hook
 * ============================================================================
 * Specification Reference: GO-002 / HOOK-001 / UI-001 / ENG-001
 * Custom Hook for Fetching Production Stabilization Telemetry & GATE 30 Evidence
 * Note: 100% REST API consumption — 0 Prisma, 0 Repositories, 0 Services.
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { StabilizationDashboardDto, GoLiveGate30EvidenceDto } from "../../../types/operations-stabilization.dto";

export function useProductionStabilization() {
  const [data, setData] = useState<StabilizationDashboardDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/operations/stabilization/status");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch production stabilization dashboard");
      }
      setData(json.data);
    } catch (err: any) {
      setError(err?.message || "An error occurred while loading stabilization telemetry");
    } finally {
      setLoading(false);
    }
  }, []);

  const evaluateCheckpoint = useCallback(async () => {
    try {
      const res = await fetch("/api/operations/stabilization/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Stabilization evaluation failed");
      }
      await fetchDashboard();
    } catch (err: any) {
      setError(err?.message || "Evaluation failed");
    }
  }, [fetchDashboard]);

  const recordEvidence = useCallback(async (): Promise<GoLiveGate30EvidenceDto | null> => {
    try {
      const res = await fetch("/api/operations/stabilization/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Recording production evidence failed");
      }
      await fetchDashboard();
      return json.data;
    } catch (err: any) {
      setError(err?.message || "Recording production evidence failed");
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
    evaluateCheckpoint,
    recordEvidence,
  };
}
