"use client";

import { useState, useEffect } from "react";

export interface FinanceMetrics {
  totalRevenue: number;
  totalReceivables: number;
  paidRevenue: number;
  openInvoicesCount: number;
  overdueInvoicesCount: number;
  averageInvoiceValue: number;
}

export function useFinanceDashboard() {
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/finance/analytics");
        const json = await res.json();
        if (json.success) {
          setMetrics(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { metrics, loading };
}
