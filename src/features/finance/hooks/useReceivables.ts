"use client";

import { useState, useEffect } from "react";

export interface AgingReport {
  current: number;
  days1_30: number;
  days31_60: number;
  days61_90: number;
  days90Plus: number;
  totalReceivables: number;
}

export function useReceivables() {
  const [report, setReport] = useState<AgingReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/finance/receivables");
        const json = await res.json();
        if (json.success) {
          setReport(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { report, loading };
}
