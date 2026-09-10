"use client";

import { useState, useEffect, useCallback } from "react";
import { Invoice } from "./useInvoices";

export function useInvoice(id?: string) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/finance/invoices/${id}`);
      const json = await res.json();
      if (json.success) {
        setInvoice(json.data);
      } else {
        setError(json.error || "Invoice not found");
      }
    } catch (err: any) {
      setError(err.message || "Network error loading invoice");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  return { invoice, loading, error, refetch: fetchInvoice };
}
