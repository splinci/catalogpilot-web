"use client";

import { useEffect, useState } from "react";
import { DashboardSummary } from "@/types/dashboard";

interface DashboardResponse {
  success: boolean;
  data: DashboardSummary;
}

export function useDashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchDashboard() {
    try {
      setLoading(true);

      const response = await fetch("/api/dashboard/summary");

      if (!response.ok) {
        throw new Error("Failed to load dashboard");
      }

      const json: DashboardResponse = await response.json();

      setData(json.data);
      setError(null);
    } catch {
      setError("Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    data,
    loading,
    error,
    refresh: fetchDashboard,
  };
}