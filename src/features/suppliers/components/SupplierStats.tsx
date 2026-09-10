"use client";

import { useSuppliers } from "@/hooks/useSuppliers";

import StatCard from "@/components/common/StatCard";

export function SupplierStats() {
  const { suppliers } = useSuppliers();

  const total = suppliers.length;

  const active = suppliers.filter(
    (supplier) => supplier.status === "ACTIVE"
  ).length;

  const inactive = total - active;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title="Total Suppliers"
        value={total}
      />

      <StatCard
        title="Active Suppliers"
        value={active}
      />

      <StatCard
        title="Inactive Suppliers"
        value={inactive}
      />
    </div>
  );
}