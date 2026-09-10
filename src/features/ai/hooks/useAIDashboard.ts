"use client";

import { useState, useEffect, useCallback } from "react";

export function useAIDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, anaRes] = await Promise.all([
        fetch("/api/ai/dashboard"),
        fetch("/api/ai/analytics"),
      ]);

      const dashJson = await dashRes.json();
      const anaJson = await anaRes.json();

      if (dashJson.success) setDashboard(dashJson.data);
      if (anaJson.success) setAnalytics(anaJson.data);
    } catch (err: any) {
      setError(err.message || "Failed to load AI dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboard,
    analytics,
    loading,
    error,
    refetch: fetchDashboardData,
  };
}
