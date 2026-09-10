"use client";

import { useState, useEffect, useCallback } from "react";
import { CustomerAggregate } from "./useCustomers";

export interface CustomerActivityItem {
  id: string;
  type: "ORDER" | "QUOTATION" | "SHIPMENT" | "AUDIT";
  title: string;
  description: string;
  timestamp: string;
}

export function useCustomerDetails(customerId?: string) {
  const [customer, setCustomer] = useState<CustomerAggregate | null>(null);
  const [timeline, setTimeline] = useState<CustomerActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const [custRes, timelineRes] = await Promise.all([
        fetch(`/api/customers/${customerId}`),
        fetch(`/api/customers/${customerId}/details`),
      ]);

      const custJson = await custRes.json();
      const timelineJson = await timelineRes.json();

      if (custJson.success) {
        setCustomer(custJson.data);
      } else {
        setError(custJson.error || "Failed to load customer detail");
      }

      if (timelineJson.success) {
        setTimeline(timelineJson.data.timeline || []);
      }
    } catch (err: any) {
      setError(err.message || "Network error loading customer detail");
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return { customer, timeline, loading, error, refetch: fetchDetails };
}
