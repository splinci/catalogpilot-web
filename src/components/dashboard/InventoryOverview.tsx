"use client";

import Card from "@/components/ui/Card";
import { DashboardSummary } from "@/types/dashboard";

interface InventoryOverviewProps {
  data: DashboardSummary | null;
  loading: boolean;
  error: string | null;
}

export default function InventoryOverview({
  data,
  loading,
  error,
}: InventoryOverviewProps) {
  if (loading) {
    return (
      <Card title="Inventory Overview">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-8 rounded bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card title="Inventory Overview">
        <div className="text-red-600">
          Unable to load inventory.
        </div>
      </Card>
    );
  }

  return (
    <Card title="Inventory Overview">
      <div className="space-y-4">
        <div className="flex justify-between">
          <span>🟢 In Stock</span>
          <span className="font-semibold">
            {data.inventoryOverview.inStock}
          </span>
        </div>

        <div className="flex justify-between">
          <span>🟡 Low Stock</span>
          <span className="font-semibold">
            {data.inventoryOverview.lowStock}
          </span>
        </div>

        <div className="flex justify-between">
          <span>🔴 Out of Stock</span>
          <span className="font-semibold">
            {data.inventoryOverview.outOfStock}
          </span>
        </div>
      </div>
    </Card>
  );
}