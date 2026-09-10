"use client";

import Card from "@/components/ui/Card";
import { DashboardSummary } from "@/types/dashboard";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from "recharts";

interface Props {
  data: DashboardSummary | null;
  loading: boolean;
  error: string | null;
}

export default function ProductsByCategory({
  data,
  loading,
  error,
}: Props) {
  if (loading) {
    return (
      <Card title="Products by Category">
        <div className="h-64 animate-pulse rounded bg-slate-100" />
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card title="Products by Category">
        <p className="text-red-600">
          Unable to load category chart.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Products by Category">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.categoryDistribution}>
            <XAxis dataKey="category" />
            <Tooltip />
            <Bar
              dataKey="products"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}