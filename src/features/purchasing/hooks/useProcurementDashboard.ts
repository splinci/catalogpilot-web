"use client";

import { useState, useEffect } from "react";
import { ProcurementStats } from "@/types/purchasing.dto";

export function useProcurementDashboard() {
  const [stats, setStats] = useState<ProcurementStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/purchasing/dashboard");
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { stats, loading };
}
