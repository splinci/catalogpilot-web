"use client";

import { useState, useEffect, useCallback } from "react";
import { CreateSupplierInput } from "@/types/purchasing.dto";

export interface SupplierItem {
  id: string;
  code: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  createdAt: string;
  _count?: { pos: number; products: number };
}

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/purchasing/suppliers");
      const json = await res.json();
      if (json.success) {
        const list = Array.isArray(json.data) ? json.data : (json.data?.items ?? []);
        setSuppliers(list);
      } else {
        setError(json.error || "Failed to load suppliers");
      }
    } catch (err: any) {
      setError(err.message || "Network error loading suppliers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const createSupplier = async (data: CreateSupplierInput) => {
    const res = await fetch("/api/purchasing/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Failed to create supplier");
    }
    await fetchSuppliers();
    return json.data;
  };

  return {
    suppliers,
    loading,
    error,
    refetch: fetchSuppliers,
    createSupplier,
  };
}
