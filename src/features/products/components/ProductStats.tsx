"use client";

import StatCard from "@/components/common/StatCard";

import type { Product } from "@/domains/product/types/product";

interface ProductStatsProps {
  products: Product[];
}

export function ProductStats({
  products,
}: ProductStatsProps) {
  const total = products.length;

  const active = products.filter(
    (p) => p.status === "ACTIVE"
  ).length;

  const archived = products.filter(
    (p) => p.status === "INACTIVE"
  ).length;

  const lowStock = products.filter(
    (p) => p.currentStock <= p.minimumStock
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard title="Total Products" value={total} />
      <StatCard title="Active Products" value={active} />
      <StatCard title="Low Stock" value={lowStock} />
      <StatCard title="Archived Products" value={archived} />
    </div>
  );
}