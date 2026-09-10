"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { EmptyState } from "./EmptyState";

interface SalesPoint {
  period: string;
  revenue: number;
  ordersCount: number;
  growth?: number;
}

interface SalesPerformanceChartProps {
  data: SalesPoint[];
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-xl text-xs">
      <p className="font-bold text-slate-600 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.dataKey === "revenue" ? `$${(p.value / 1000).toFixed(1)}K` : p.value}
        </p>
      ))}
    </div>
  );
};

export function SalesPerformanceChart({ data, title = "Sales Performance" }: SalesPerformanceChartProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
        <p className="text-xs text-slate-400 mt-0.5">Revenue bars · Order count line</p>
      </div>
      <div className="p-5">
        {data.length === 0 ? (
          <EmptyState title="No sales data" description="No sales performance data for this period." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="revenue" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="revenue" dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Line yAxisId="orders" type="monotone" dataKey="ordersCount" name="Orders" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b" }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
