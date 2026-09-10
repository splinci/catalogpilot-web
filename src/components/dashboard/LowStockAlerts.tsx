"use client";

import Card from "@/components/ui/Card";
import { DashboardSummary } from "@/types/dashboard";

interface LowStockAlertsProps {
  data: DashboardSummary | null;
  loading: boolean;
  error: string | null;
}

export default function LowStockAlerts({
  data,
  loading,
  error,
}: LowStockAlertsProps) {
  if (loading) {
    return (
      <Card title="Low Stock Alerts">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-10 rounded bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card title="Low Stock Alerts">
        <p className="text-red-600">
          Unable to load alerts.
        </p>
      </Card>
    );
  }

  if (data.lowStockProducts.length === 0) {
    return (
      <Card title="Low Stock Alerts">
        <p className="text-green-600">
          🎉 No low stock products.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Low Stock Alerts">
      <div className="space-y-4">
        {data.lowStockProducts.map((product) => (
          <div
            key={product.id}
            className="flex justify-between border-b pb-3 last:border-0"
          >
            <div>
              <div className="font-medium">
                {product.name}
              </div>

              <div className="text-sm text-slate-500">
                {product.sku}
              </div>
            </div>

            <div className="text-right">
              <div className="font-semibold text-red-600">
                {product.currentStock}
              </div>

              <div className="text-xs text-slate-500">
                Min: {product.minimumStock}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}