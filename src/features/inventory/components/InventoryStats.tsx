"use client";

import StatCard from "@/components/common/StatCard";
import { useInventoryStats } from "@/hooks/useInventoryStats";

export function InventoryStats() {
  const { stats, loading } = useInventoryStats();

  if (loading || !stats) {
    return (
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Products" value={0} subtitle="Loading..." />
        <StatCard title="Active" value={0} subtitle="Loading..." />
        <StatCard title="Low Stock" value={0} subtitle="Loading..." />
        <StatCard title="Archived" value={0} subtitle="Loading..." />
      </div>
    );
  }

  return (
    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Products"
        value={stats.total}
        subtitle="Total inventory items"
      />

      <StatCard
        title="Active"
        value={stats.active}
        subtitle="Available products"
      />

      <StatCard
        title="Low Stock"
        value={stats.lowStock}
        subtitle="Need replenishment"
      />

      <StatCard
        title="Archived"
        value={stats.archived}
        subtitle="Inactive products"
      />
    </div>
  );
}