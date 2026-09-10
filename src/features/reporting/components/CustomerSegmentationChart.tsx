"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { EmptyState } from "./EmptyState";

interface SegmentationData {
  vip?: number;
  loyal?: number;
  atRisk?: number;
  churned?: number;
  prospect?: number;
  total?: number;
}

interface CustomerSegmentationChartProps {
  data: SegmentationData;
}

const SEGMENTS = [
  { key: "vip",      label: "VIP / Premium",   color: "#6366f1" },
  { key: "loyal",    label: "Loyal / Regular",  color: "#10b981" },
  { key: "prospect", label: "Prospect / New",   color: "#0ea5e9" },
  { key: "atRisk",   label: "At-Risk",          color: "#f59e0b" },
  { key: "churned",  label: "Churned",          color: "#f43f5e" },
];

export function CustomerSegmentationChart({ data }: CustomerSegmentationChartProps) {
  const chartData = SEGMENTS
    .map((s) => ({ name: s.label, value: data[s.key as keyof typeof data] as number ?? 0, color: s.color }))
    .filter((s) => s.value > 0);

  const total = data.total ?? chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 text-sm">Customer Segmentation</h3>
        <p className="text-xs text-slate-400 mt-0.5">Total: {total.toLocaleString()} customers</p>
      </div>
      <div className="p-5">
        {chartData.length === 0 ? (
          <EmptyState title="No segmentation data" description="Customer segments are not yet calculated." />
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${Number(v ?? 0).toLocaleString()} (${total > 0 ? ((Number(v ?? 0) / total) * 100).toFixed(0) : 0}%)`, ""]} contentStyle={{ borderRadius: "12px", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex-1 space-y-3">
              {SEGMENTS.map((seg) => {
                const count = data[seg.key as keyof typeof data] as number ?? 0;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={seg.key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: seg.color }} />
                        {seg.label}
                      </span>
                      <span className="text-slate-500 tabular-nums">{count.toLocaleString()} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: seg.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
