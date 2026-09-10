"use client";

import { useState, useEffect } from "react";

export interface ActivityItem {
  id: string;
  type: "ORDER" | "QUOTATION" | "SHIPMENT" | "AUDIT";
  title: string;
  description: string;
  timestamp: string;
}

export function useCustomerActivity(customerId?: string) {
  const [timeline, setTimeline] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!customerId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/customers/${customerId}/details`);
        const json = await res.json();
        if (json.success) {
          setTimeline(json.data.timeline || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [customerId]);

  return { timeline, loading };
}
