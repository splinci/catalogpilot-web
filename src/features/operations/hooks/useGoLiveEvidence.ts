"use client";

/**
 * ============================================================================
 * Splinci Commerce OS — Custom Hook for Production Go-Live Evidence
 * ============================================================================
 * Specification Reference: GO-003 / GO-001 / GO-002 / SAD-001
 * Architecture Rule: 100% REST networking via /api/operations/go-live-evidence/*
 * Zero direct Prisma, repository, or domain service imports allowed.
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { GoLiveEvidenceDashboardDto } from "@/types/operations-governance.dto";

export function useGoLiveEvidence() {
  const [dashboard, setDashboard] = useState<GoLiveEvidenceDashboardDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/operations/go-live-evidence/summary", {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}: Failed to fetch go-live evidence summary`);
      }

      const data: GoLiveEvidenceDashboardDto = await res.json();
      setDashboard(data);
    } catch (err: any) {
      setError(err.message || "Failed to load production evidence dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const captureSample = async () => {
    setIsCapturing(true);
    setActionMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/operations/go-live-evidence/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to capture production sample");
      }

      const data = await res.json();
      setActionMessage(data.message || "Production observation sample captured");
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to capture production sample");
    } finally {
      setIsCapturing(false);
    }
  };

  const evaluateWindow = async () => {
    setIsLoading(true);
    setActionMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/operations/go-live-evidence/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to evaluate observation window");
      }

      const data = await res.json();
      setActionMessage(data.message || "Observation window evaluated");
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to evaluate observation window");
    } finally {
      setIsLoading(false);
    }
  };

  const finalizePackage = async () => {
    setIsFinalizing(true);
    setActionMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/operations/go-live-evidence/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to finalize evidence package");
      }

      const data = await res.json();
      setActionMessage(data.message || "Evidence package finalized for governance review");
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to finalize evidence package");
    } finally {
      setIsFinalizing(false);
    }
  };

  return {
    dashboard,
    isLoading,
    isCapturing,
    isFinalizing,
    error,
    actionMessage,
    refresh: fetchDashboard,
    captureSample,
    evaluateWindow,
    finalizePackage,
  };
}
