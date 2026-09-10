/**
 * ============================================================================
 * Splinci Commerce OS — Backup Recovery Custom React Hook
 * ============================================================================
 * Specification Reference: CI-008 / HOOK-001 / UI-001 / ENG-001
 * Custom Hook for Fetching & Exercising PostgreSQL Backup Restoration Drills
 * Note: 100% REST API consumption — 0 Prisma, 0 Repositories, 0 Services.
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { BackupRecoveryDashboardDto, RestoreExerciseResultDto, RestoreExerciseRequestDto } from "../../../types/operations-backup.dto";

export function useBackupRecovery() {
  const [data, setData] = useState<BackupRecoveryDashboardDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/operations/backup-recovery/status");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch backup recovery dashboard");
      }
      setData(json.data);
    } catch (err: any) {
      setError(err?.message || "An error occurred while loading backup telemetry");
    } finally {
      setLoading(false);
    }
  }, []);

  const executeStagingRestore = useCallback(async (request: RestoreExerciseRequestDto): Promise<RestoreExerciseResultDto | null> => {
    try {
      const res = await fetch("/api/operations/backup-recovery/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Staging restore exercise failed");
      }
      await fetchDashboard();
      return json.data;
    } catch (err: any) {
      setError(err?.message || "Restore execution failed");
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
    executeStagingRestore,
  };
}
