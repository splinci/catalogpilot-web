"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { EmptyState } from "./EmptyState";

interface SpendPoint {
  period: string;
  spend: number;
  poCount?: number;
}

interface PurchasingSpendChartProps {
  data: SpendPoint[];
  title?: string;
}

export function PurchasingSpendChart({ data, title = "Purchase Spend Trend" }: PurchasingSpendChartProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
        <p className="text-xs text-slate-400 mt-0.5">Total procurement spend over time</p>
      </div>
      <div className="p-5">
        {data.length === 0 ? (
          <EmptyState title="No spend data" description="No purchasing spend data available." />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(v: any) => [`$${(Number(v ?? 0) / 1000).toFixed(1)}K`, "Spend"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }}
              />
              <Area type="monotone" dataKey="spend" name="Spend" stroke="#f59e0b" strokeWidth={2.5} fill="url(#spendGrad)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
