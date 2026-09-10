"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { EmptyState } from "./EmptyState";

interface MovementPoint {
  date: string;
  receipts: number;
  shipments: number;
  adjustments?: number;
}

interface InventoryMovementChartProps {
  data: MovementPoint[];
  title?: string;
}

export function InventoryMovementChart({ data, title = "Inventory Movement" }: InventoryMovementChartProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
        <p className="text-xs text-slate-400 mt-0.5">Receipts in · Shipments out · Net adjustments</p>
      </div>
      <div className="p-5">
        {data.length === 0 ? (
          <EmptyState title="No movement data" description="No inventory movement recorded." />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="receipts" name="Receipts" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={24} />
              <Bar dataKey="shipments" name="Shipments" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={24} />
              {data.some(d => d.adjustments != null) && (
                <Bar dataKey="adjustments" name="Adjustments" fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={24} />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
