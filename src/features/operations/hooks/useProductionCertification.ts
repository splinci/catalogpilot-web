/**
 * ============================================================================
 * Splinci Commerce OS — Production Certification Custom React Hook
 * ============================================================================
 * Specification Reference: CI-009 / HOOK-001 / UI-001 / ENG-001
 * Custom Hook for Fetching Production Certification & Go-Live Readiness Telemetry
 * Note: 100% REST API consumption — 0 Prisma, 0 Repositories, 0 Services.
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { CertificationDashboardDto, CertificationSignOffRequestDto } from "../../../types/operations-certification.dto";

export function useProductionCertification() {
  const [data, setData] = useState<CertificationDashboardDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/operations/certification/dashboard");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch production certification dashboard");
      }
      setData(json.data);
    } catch (err: any) {
      setError(err?.message || "An error occurred while loading certification telemetry");
    } finally {
      setLoading(false);
    }
  }, []);

  const executeSignOff = useCallback(async (request: CertificationSignOffRequestDto): Promise<boolean> => {
    try {
      const res = await fetch("/api/operations/certification/sign-off", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Administrative sign-off failed");
      }
      await fetchDashboard();
      return true;
    } catch (err: any) {
      setError(err?.message || "Sign-off failed");
      return false;
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
    executeSignOff,
  };
}
