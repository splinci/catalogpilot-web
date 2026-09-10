"use client";

import { useState, useCallback, useEffect } from "react";

export function useWorkflowAnalytics() {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [resAnal, resDash] = await Promise.all([
        fetch("/api/workflows/analytics"),
        fetch("/api/workflows/dashboard"),
      ]);

      const jsonAnal = await resAnal.json();
      const jsonDash = await resDash.json();

      if (!resAnal.ok || !jsonAnal.success) {
        throw new Error(jsonAnal.error || "Failed to fetch analytics");
      }

      setAnalytics(jsonAnal.data);
      setDashboard(jsonDash.success ? jsonDash.data : null);
    } catch (err: any) {
      setError(err.message || "Failed to load workflow analytics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    dashboard,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}
