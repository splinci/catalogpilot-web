/**
 * ============================================================================
 * M10-004 — useScheduledReports Hook
 * Consumes GET/POST/PUT/DELETE /api/reporting/scheduled
 * ============================================================================
 */
"use client";

import { useState, useEffect, useCallback } from "react";

export interface ScheduledReport {
  id: string;
  name: string;
  reportType: string;
  frequency: string;
  isActive: boolean;
  recipients: string[];
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
}

export interface CreateSchedulePayload {
  name: string;
  reportType: string;
  frequency: string;
  recipients?: string[];
  isActive?: boolean;
}

export interface UpdateSchedulePayload {
  name?: string;
  frequency?: string;
  recipients?: string[];
  isActive?: boolean;
}

export interface UseScheduledReportsResult {
  data: ScheduledReport[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createSchedule: (payload: CreateSchedulePayload) => Promise<ScheduledReport>;
  updateSchedule: (id: string, payload: UpdateSchedulePayload) => Promise<ScheduledReport>;
  deleteSchedule: (id: string) => Promise<void>;
  runSchedule: (id: string) => Promise<void>;
}

export function useScheduledReports(): UseScheduledReportsResult {
  const [data, setData] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/reporting/scheduled", { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Fetch failed");
      setData(json.data?.items ?? json.data ?? []);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const createSchedule = async (payload: CreateSchedulePayload): Promise<ScheduledReport> => {
    const res = await fetch("/api/reporting/scheduled", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? "Create failed");
    await refetch();
    return json.data;
  };

  const updateSchedule = async (id: string, payload: UpdateSchedulePayload): Promise<ScheduledReport> => {
    const res = await fetch(`/api/reporting/scheduled/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? "Update failed");
    await refetch();
    return json.data;
  };

  const deleteSchedule = async (id: string): Promise<void> => {
    const res = await fetch(`/api/reporting/scheduled/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? "Delete failed");
    await refetch();
  };

  const runSchedule = async (id: string): Promise<void> => {
    const res = await fetch(`/api/reporting/scheduled/${id}/run`, { method: "POST" });
    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? "Run failed");
  };

  return { data, loading, error, refetch, createSchedule, updateSchedule, deleteSchedule, runSchedule };
}
