"use client";

import StatCard from "@/components/common/StatCard";
import { DashboardSummary } from "@/types/dashboard";

interface DashboardStatsProps {
  data: DashboardSummary | null;
  loading: boolean;
  error: string | null;
}

export default function DashboardStats({
  data,
  loading,
  error,
}: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-28 rounded-xl bg-gray-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 mb-6">
        {error ?? "Unable to load dashboard metrics."}
      </div>
    );
  }

  const formattedRevenue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(data.totalRevenue ?? 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-6">
      <StatCard title="Total Revenue" value={formattedRevenue} />
      <StatCard title="Total Orders" value={data.totalOrders ?? 0} />
      <StatCard title="Active Customers" value={data.activeCustomers ?? 0} />
      <StatCard title="Total Products" value={data.totalProducts} />
      <StatCard title="Inventory In Stock" value={data.inventoryItems} />
      <StatCard title="Low Stock Alerts" value={data.lowStock} />
    </div>
  );
}