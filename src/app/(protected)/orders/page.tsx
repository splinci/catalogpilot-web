"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { useOrders, SalesOrderAggregate } from "@/features/orders/hooks/useOrders";
import { useOrderAnalytics } from "@/features/orders/hooks/useOrderAnalytics";
import { OrderKPIs } from "@/features/orders/components/OrderKPIs";
import { SalesOrderTable } from "@/features/orders/components/SalesOrderTable";
import { CreateOrderModal } from "@/features/orders/components/CreateOrderModal";
import { DispatchShipmentModal } from "@/features/orders/components/DispatchShipmentModal";
import { CreateShipmentInput } from "@/types/order.dto";

export default function OrdersPage() {
  const { orders, loading, refetch, createOrder } = useOrders();
  const { stats, loading: statsLoading } = useOrderAnalytics();

  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrderAggregate | null>(null);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const filteredOrders = safeOrders.filter(
    (o) =>
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.legalName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleShipmentSubmit = async (orderId: string, input: CreateShipmentInput) => {
    const res = await fetch(`/api/orders/${orderId}/ship`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Failed to dispatch shipment");
    }
    await refetch();
  };

  return (
    <div className="space-y-6">
      <PageHero
        title="Order Management System (OMS)"
        description="Process customer sales orders, track order lifecycles, lock real-time inventory stock reservations, and dispatch shipments."
        actions={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Sales Order</span>
          </button>
        }
      />

      <OrderKPIs stats={stats} loading={statsLoading} />

      <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order number or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border-0 py-2 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <SalesOrderTable
          orders={filteredOrders}
          loading={loading}
          onShipOrder={(order) => setSelectedOrder(order)}
        />
      </div>

      <CreateOrderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={createOrder}
      />

      <DispatchShipmentModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onSubmit={handleShipmentSubmit}
      />
    </div>
  );
}