/**
 * ============================================================================
 * Ondrio Commerce OS — Reporting Hooks
 * ============================================================================
 * M10-004: React hooks consuming /api/reporting/* endpoints
 * ============================================================================
 */

"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Generic fetcher ─────────────────────────────────────────────────────────

async function fetchReporting<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`/api/reporting/${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Reporting API error: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Unknown reporting error");
  return json.data as T;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useReportingDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchReporting<any>("dashboard");
      setData(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, refetch: load };
}

// ─── Executive KPIs ───────────────────────────────────────────────────────────

export function useExecutiveKPIs() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchReporting<any>("executive");
      setData(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, refetch: load };
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export function useReportingAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchReporting<any>("analytics");
      setData(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, refetch: load };
}

// ─── Sales ────────────────────────────────────────────────────────────────────

export function useSalesReport(params?: Record<string, string>) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchReporting<any>("sales", params);
      setData(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, refetch: load };
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export function useInventoryReport(params?: Record<string, string>) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchReporting<any>("inventory", params);
      setData(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, refetch: load };
}

// ─── Purchasing ───────────────────────────────────────────────────────────────

export function usePurchasingReport(params?: Record<string, string>) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchReporting<any>("purchasing", params);
      setData(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, refetch: load };
}

// ─── Finance ──────────────────────────────────────────────────────────────────

export function useFinanceReport(params?: Record<string, string>) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchReporting<any>("finance", params);
      setData(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, refetch: load };
}

// ─── CRM ──────────────────────────────────────────────────────────────────────

export function useCRMReport(params?: Record<string, string>) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchReporting<any>("crm", params);
      setData(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, refetch: load };
}

// ─── Scheduled Reports ────────────────────────────────────────────────────────

export function useScheduledReports() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchReporting<any>("scheduled");
      setData(result?.items || result || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSchedule = async (payload: any) => {
    const res = await fetch("/api/reporting/scheduled", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    await load();
    return json.data;
  };

  const deleteSchedule = async (id: string) => {
    const res = await fetch(`/api/reporting/scheduled/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    await load();
  };

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, refetch: load, createSchedule, deleteSchedule };
}
