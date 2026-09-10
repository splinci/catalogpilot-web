"use client";

import StatCard from "@/components/common/StatCard";

import { useBrands } from "../hooks/useBrands";

export function BrandStats() {
  const { brands } = useBrands();

  const total = brands.length;

  const enabled = brands.filter(
    (brand) => brand.enabled
  ).length;

  const disabled = brands.filter(
    (brand) => !brand.enabled
  ).length;

  const websites = brands.filter(
    (brand) => brand.websiteUrl
  ).length;

  return (
    <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Brands"
        value={total}
        subtitle="Total product brands"
      />

      <StatCard
        title="Enabled"
        value={enabled}
        subtitle="Available brands"
      />

      <StatCard
        title="Disabled"
        value={disabled}
        subtitle="Inactive brands"
      />

      <StatCard
        title="Websites"
        value={websites}
        subtitle="Brands with websites"
      />
    </div>
  );
}