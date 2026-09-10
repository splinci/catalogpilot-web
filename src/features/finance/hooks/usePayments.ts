"use client";

import { useState, useEffect, useCallback } from "react";
import { RecordPaymentInput } from "@/types/finance.dto";

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: string;
  reference?: string | null;
  paidAt: string;
  invoice?: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    customer?: { legalName: string };
  };
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/finance/payments");
      const json = await res.json();
      if (json.success) {
        setPayments(json.data || []);
      } else {
        setError(json.error || "Failed to load payments");
      }
    } catch (err: any) {
      setError(err.message || "Network error loading payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const recordPayment = async (data: RecordPaymentInput) => {
    const res = await fetch("/api/finance/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Failed to record payment");
    }
    await fetchPayments();
    return json.data;
  };

  return { payments, loading, error, refetch: fetchPayments, recordPayment };
}
