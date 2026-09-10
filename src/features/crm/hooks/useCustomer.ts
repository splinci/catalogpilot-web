"use client";

import { useState, useEffect, useCallback } from "react";
import { Customer } from "./useCustomers";

export function useCustomer(id?: string) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/customers/${id}`);
      const json = await res.json();
      if (json.success) {
        setCustomer(json.data);
      } else {
        setError(json.error || "Customer not found");
      }
    } catch (err: any) {
      setError(err.message || "Network error loading customer");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  return { customer, loading, error, refetch: fetchCustomer };
}
