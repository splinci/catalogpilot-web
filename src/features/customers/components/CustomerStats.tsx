"use client";

import StatCard from "@/components/common/StatCard";

import type { Customer } from "@/domains/customer/types/customer";

interface CustomerStatsProps {
  customers: Customer[];
}

export function CustomerStats({
  customers,
}: CustomerStatsProps) {
  const total = customers.length;

  const active = customers.filter(
    (customer) => customer.status === "ACTIVE"
  ).length;

  const inactive = customers.filter(
    (customer) => customer.status === "INACTIVE"
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title="Total Customers"
        value={total}
      />

      <StatCard
        title="Active Customers"
        value={active}
      />

      <StatCard
        title="Inactive Customers"
        value={inactive}
      />
    </div>
  );
}