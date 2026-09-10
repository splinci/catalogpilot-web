/**
 * ============================================================================
 * Splinci Commerce OS — useOperationsIncidents Hook
 * ============================================================================
 * Specification Reference: M12-004 / API-001 / UI-001
 * Consumes: /api/operations/incidents, /api/operations/incidents/summary, /api/operations/incidents/critical
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { IncidentItemDto } from "@/types/operations.dto";

export function useOperationsIncidents(params?: { source?: string; severity?: string; page?: number; limit?: number }) {
  const [incidents, setIncidents] = useState<IncidentItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<any>(null);
  const [critical, setCritical] = useState<IncidentItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidentsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set("page", params.page.toString());
      if (params?.limit) queryParams.set("limit", params.limit.toString());
      if (params?.source) queryParams.set("source", params.source);
      if (params?.severity) queryParams.set("severity", params.severity);

      const [listRes, summaryRes, criticalRes] = await Promise.all([
        fetch(`/api/operations/incidents?${queryParams.toString()}`),
        fetch("/api/operations/incidents/summary"),
        fetch("/api/operations/incidents/critical"),
      ]);

      const [listJson, summaryJson, criticalJson] = await Promise.all([
        listRes.json(),
        summaryRes.json(),
        criticalRes.json(),
      ]);

      if (listJson.success) {
        setIncidents(listJson.data.incidents || []);
        setTotal(listJson.data.total || 0);
      }
      if (summaryJson.success) setSummary(summaryJson.data);
      if (criticalJson.success) setCritical(criticalJson.data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load operational incidents");
    } finally {
      setLoading(false);
    }
  }, [params?.page, params?.limit, params?.source, params?.severity]);

  useEffect(() => {
    fetchIncidentsData();
  }, [fetchIncidentsData]);

  return {
    incidents,
    total,
    summary,
    critical,
    loading,
    error,
    refresh: fetchIncidentsData,
  };
}
