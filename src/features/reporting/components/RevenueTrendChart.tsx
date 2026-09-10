"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { EmptyState } from "./EmptyState";

interface TrendPoint {
  period: string;
  revenue: number;
  movingAvg?: number;
}

interface RevenueTrendChartProps {
  data: TrendPoint[];
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 shadow-2xl text-xs space-y-1">
      <p className="font-bold text-slate-300 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold flex items-center justify-between gap-4">
          <span>{p.name}:</span>
          <span className="font-bold">${(p.value / 1000).toFixed(1)}K</span>
        </p>
      ))}
    </div>
  );
};

export function RevenueTrendChart({ data, title = "Revenue Trend" }: RevenueTrendChartProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-extrabold text-white text-sm">{title}</h3>
        <span className="text-xs text-slate-400 font-medium">Last 12 periods</span>
      </div>
      <div className="p-5">
        {data.length === 0 ? (
          <EmptyState title="No trend data" description="No revenue trend data available." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#818cf8" strokeWidth={2} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, fill: "#818cf8" }} />
              {data.some(d => d.movingAvg != null) && (
                <Area type="monotone" dataKey="movingAvg" name="Moving Avg" stroke="#34d399" strokeWidth={2} strokeDasharray="5 3" fill="url(#avgGrad)" dot={false} activeDot={{ r: 4, fill: "#34d399" }} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
