"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, DollarSign } from "lucide-react";

const sampleChartData = [
  { month: "Jan", revenue: 4200, orders: 28 },
  { month: "Feb", revenue: 6100, orders: 35 },
  { month: "Mar", revenue: 5800, orders: 32 },
  { month: "Apr", revenue: 8400, orders: 48 },
  { month: "May", revenue: 9900, orders: 54 },
  { month: "Jun", revenue: 11200, orders: 62 },
  { month: "Jul", revenue: 13590, orders: 75 },
];

export default function SalesRevenueChart() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <DollarSign className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Revenue & Order Trends
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time monthly gross revenue performance across all sales channels.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
          <TrendingUp className="h-4 w-4" />
          <span>+24.8% vs last month</span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sampleChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: "12px",
                border: "none",
                color: "#fff",
                fontSize: "12px",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
              }}
              formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#4f46e5"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
