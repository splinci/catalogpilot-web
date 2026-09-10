"use client";

import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface SupplierRow {
  supplierName: string;
  totalOrders: number;
  onTimeDeliveryRate: number;
  avgLeadTimeDays: number;
  qualityScore?: number;
  totalSpend?: number;
}

interface SupplierPerformanceTableProps {
  data: SupplierRow[];
}

function GradeChip({ rate }: { rate: number }) {
  const { label, cls } =
    rate >= 90 ? { label: "A", cls: "bg-emerald-100 text-emerald-700" }
    : rate >= 75 ? { label: "B", cls: "bg-sky-100 text-sky-700" }
    : rate >= 60 ? { label: "C", cls: "bg-amber-100 text-amber-700" }
    : { label: "D", cls: "bg-rose-100 text-rose-700" };

  return (
    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${cls}`}>
      {label}
    </span>
  );
}

function RateBar({ value, color = "bg-emerald-400" }: { value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 bg-slate-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="text-xs font-bold tabular-nums text-slate-700">{value.toFixed(1)}%</span>
    </div>
  );
}

export function SupplierPerformanceTable({ data }: SupplierPerformanceTableProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs p-8 text-center text-slate-400 text-sm">
        No supplier performance data.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-emerald-500" />
        <h3 className="font-bold text-slate-900 text-sm">Supplier Scorecards</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["Supplier", "Orders", "On-Time Rate", "Avg Lead Time", "Quality", "Grade"].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-800">{row.supplierName}</td>
                <td className="px-4 py-3 text-slate-600 tabular-nums">{row.totalOrders}</td>
                <td className="px-4 py-3">
                  <RateBar value={row.onTimeDeliveryRate} color={row.onTimeDeliveryRate >= 80 ? "bg-emerald-400" : "bg-amber-400"} />
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {row.avgLeadTimeDays.toFixed(1)} days
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 tabular-nums">{row.qualityScore?.toFixed(0) ?? "—"}</td>
                <td className="px-4 py-3">
                  <GradeChip rate={row.onTimeDeliveryRate} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
