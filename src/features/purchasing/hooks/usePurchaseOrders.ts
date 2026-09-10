"use client";

import { useState, useEffect, useCallback } from "react";
import { CreatePurchaseOrderInput } from "@/types/purchasing.dto";

export interface PurchaseOrderLineItem {
  id: string;
  productId: string;
  orderedQty: number;
  unitCost: number;
  totalCost: number;
  product?: { id: string; sku: string; title: string };
}

export interface PurchaseOrderAggregate {
  id: string;
  poNumber: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "SENT" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CLOSED" | "CANCELLED";
  totalAmount: number;
  supplierId: string;
  createdAt: string;
  supplier?: { id: string; code: string; name: string };
  lines: PurchaseOrderLineItem[];
}

export function usePurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrderAggregate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (search = "", status = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status) params.append("status", status);

      const res = await fetch(`/api/purchasing/orders?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data.items || []);
      } else {
        setError(json.error || "Failed to load purchase orders");
      }
    } catch (err: any) {
      setError(err.message || "Network error loading purchase orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = async (data: CreatePurchaseOrderInput) => {
    const res = await fetch("/api/purchasing/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Failed to create purchase order");
    }
    await fetchOrders();
    return json.data;
  };

  const updateStatus = async (id: string, status: string, reason?: string) => {
    const res = await fetch(`/api/purchasing/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason }),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Failed to update purchase order status");
    }
    await fetchOrders();
    return json.data;
  };

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    createOrder,
    updateStatus,
  };
}
