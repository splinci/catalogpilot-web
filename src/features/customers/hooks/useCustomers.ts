"use client";

import { useState, useEffect, useCallback } from "react";
import { CreateCustomerInput, UpdateCustomerInput } from "@/types/crm.dto";

export interface CustomerAggregate {
  id: string;
  customerCode: string;
  legalName: string;
  email: string;
  phone?: string | null;
  creditLimit: number;
  creditHold: boolean;
  createdAt: string;
  contacts?: { id: string; name: string; email?: string | null; phone?: string | null; role?: string | null }[];
  addresses?: { id: string; addressType: string; street: string; city: string; state: string; postalCode: string; country: string; isDefault: boolean }[];
  orders?: { id: string; orderNumber: string; totalAmount: number; status: string; createdAt: string }[];
}

export function useCustomers() {
  const [customers, setCustomers] = useState<CustomerAggregate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async (search = "", creditHold?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (creditHold !== undefined) params.append("creditHold", String(creditHold));

      const res = await fetch(`/api/customers?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setCustomers(json.data || []);
      } else {
        setError(json.error || "Failed to load customers");
      }
    } catch (err: any) {
      setError(err.message || "Network error loading customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const createCustomer = async (data: CreateCustomerInput) => {
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Failed to create customer");
    }
    await fetchCustomers();
    return json.data;
  };

  const updateCustomer = async (id: string, data: UpdateCustomerInput) => {
    const res = await fetch(`/api/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Failed to update customer");
    }
    await fetchCustomers();
    return json.data;
  };

  const archiveCustomer = async (id: string) => {
    const res = await fetch(`/api/customers/${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Failed to archive customer");
    }
    await fetchCustomers();
    return json.data;
  };

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers,
    createCustomer,
    updateCustomer,
    archiveCustomer,
  };
}
