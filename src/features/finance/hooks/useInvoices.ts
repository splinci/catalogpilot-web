"use client";

import { useState, useEffect, useCallback } from "react";
import { CreateInvoiceInput } from "@/types/finance.dto";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  salesOrderId?: string | null;
  status: "DRAFT" | "ISSUED" | "PAID" | "CANCELLED";
  totalAmount: number;
  dueDate: string;
  postedAt?: string | null;
  createdAt: string;
  customer?: { id: string; legalName: string; email: string; customerCode: string };
  salesOrder?: { id: string; orderNumber: string };
  payments?: { id: string; amount: number; method: string; paidAt: string }[];
  creditNotes?: { id: string; cnNumber: string; amount: number; reason: string }[];
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async (search = "", status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status) params.append("status", status);

      const res = await fetch(`/api/finance/invoices?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setInvoices(json.data || []);
      } else {
        setError(json.error || "Failed to load invoices");
      }
    } catch (err: any) {
      setError(err.message || "Network error loading invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const createInvoice = async (data: CreateInvoiceInput) => {
    const res = await fetch("/api/finance/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Failed to create invoice");
    }
    await fetchInvoices();
    return json.data;
  };

  const issueInvoice = async (id: string) => {
    const res = await fetch(`/api/finance/invoices/${id}/issue`, {
      method: "POST",
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Failed to issue invoice");
    }
    await fetchInvoices();
    return json.data;
  };

  const voidInvoice = async (id: string) => {
    const res = await fetch(`/api/finance/invoices/${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Failed to void invoice");
    }
    await fetchInvoices();
    return json.data;
  };

  return {
    invoices,
    loading,
    error,
    refetch: fetchInvoices,
    createInvoice,
    issueInvoice,
    voidInvoice,
  };
}
