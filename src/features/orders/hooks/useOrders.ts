"use client";

import { useState, useEffect, useCallback } from "react";
import { CreateSalesOrderInput } from "@/types/order.dto";
import { OrderStatus } from "@prisma/client";

export interface SalesOrderLineItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: { id: string; sku: string; title: string };
}

export interface SalesOrderAggregate {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  subtotal: number;
  taxTotal: number;
  shippingFee: number;
  totalAmount: number;
  createdAt: string;
  customer?: { id: string; customerCode: string; legalName: string; email: string };
  lines: SalesOrderLineItem[];
  shipments?: any[];
}

export function useOrders() {
  const [orders, setOrders] = useState<SalesOrderAggregate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (search = "", status = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status) params.append("status", status);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data || []);
      } else {
        setError(json.error || "Failed to load sales orders");
      }
    } catch (err: any) {
      setError(err.message || "Network error loading sales orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = async (data: CreateSalesOrderInput) => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Failed to create sales order");
    }
    await fetchOrders();
    return json.data;
  };

  const updateStatus = async (id: string, status: OrderStatus, reason?: string) => {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason }),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Failed to update order status");
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
