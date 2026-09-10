/**
 * ============================================================================
 * Splinci Commerce OS — useOperationsHealth Hook
 * ============================================================================
 * Specification Reference: M12-004 / API-001 / UI-001
 * Consumes: /api/operations/health, /api/operations/health/history,
 *           /api/operations/health/check, /api/operations/telemetry, /api/operations/readiness
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { SystemHealthTelemetryDto, HealthCheckRecordDto } from "@/types/operations.dto";

export interface ReadinessResult {
  score: number;
  status: "READY" | "DEGRADED" | "NOT_READY";
  evaluatedAt: string;
  blockers: string[];
  warnings: string[];
  passedChecks: string[];
}

export function useOperationsHealth() {
  const [health, setHealth] = useState<any>(null);
  const [history, setHistory] = useState<HealthCheckRecordDto[]>([]);
  const [telemetry, setTelemetry] = useState<SystemHealthTelemetryDto | null>(null);
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthRes, historyRes, telemetryRes, readinessRes] = await Promise.all([
        fetch("/api/operations/health"),
        fetch("/api/operations/health/history"),
        fetch("/api/operations/telemetry"),
        fetch("/api/operations/readiness"),
      ]);

      const [healthJson, historyJson, telemetryJson, readinessJson] = await Promise.all([
        healthRes.json(),
        historyRes.json(),
        telemetryRes.json(),
        readinessRes.json(),
      ]);

      if (healthJson.success) setHealth(healthJson.data);
      if (historyJson.success) setHistory(historyJson.data);
      if (telemetryJson.success) setTelemetry(telemetryJson.data);
      if (readinessJson.success) setReadiness(readinessJson.data);
    } catch (err: any) {
      setError(err?.message || "Failed to load health telemetry");
    } finally {
      setLoading(false);
    }
  }, []);

  const performHealthCheck = async () => {
    try {
      const res = await fetch("/api/operations/health/check", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Health check trigger failed");
      }
      await fetchHealthData();
      return json.data;
    } catch (err: any) {
      throw new Error(err.message || "Failed to trigger health check");
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  return {
    health,
    history,
    telemetry,
    readiness,
    loading,
    error,
    refresh: fetchHealthData,
    performHealthCheck,
  };
}
