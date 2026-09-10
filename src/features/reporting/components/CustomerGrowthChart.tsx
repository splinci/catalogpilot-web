"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { EmptyState } from "./EmptyState";

interface GrowthPoint {
  period: string;
  newCustomers: number;
  churned?: number;
  total?: number;
  net?: number;
}

interface CustomerGrowthChartProps {
  data: GrowthPoint[];
  title?: string;
}

export function CustomerGrowthChart({ data, title = "Customer Growth" }: CustomerGrowthChartProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
        <p className="text-xs text-slate-400 mt-0.5">New acquisitions, churn, and net customer growth</p>
      </div>
      <div className="p-5">
        {data.length === 0 ? (
          <EmptyState title="No growth data" description="No customer growth data available." />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="newCustomers" name="New" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3, fill: "#0ea5e9" }} />
              {data.some(d => d.churned != null) && (
                <Line type="monotone" dataKey="churned" name="Churned" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3, fill: "#f43f5e" }} />
              )}
              {data.some(d => d.total != null) && (
                <Line type="monotone" dataKey="total" name="Total" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
