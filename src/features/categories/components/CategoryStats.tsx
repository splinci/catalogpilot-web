"use client";

import { useCategories } from "@/hooks/useCategories";

import StatCard from "@/components/common/StatCard";

export function CategoryStats() {
  const { categories } = useCategories();

  const total = categories.length;

  const active = categories.filter(
    (category) => category.status === "ACTIVE"
  ).length;

  const inactive = total - active;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title="Total Categories"
        value={total}
      />

      <StatCard
        title="Active Categories"
        value={active}
      />

      <StatCard
        title="Inactive Categories"
        value={inactive}
      />
    </div>
  );
}