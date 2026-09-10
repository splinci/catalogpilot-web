"use client";

import { AgingReport } from "../hooks/useReceivables";
import { Clock } from "lucide-react";

interface Props {
  report: AgingReport | null;
  loading: boolean;
}

export function ReceivablesAgingTable({ report, loading }: Props) {
  if (loading || !report) {
    return <div className="p-8 text-center text-xs text-slate-400">Calculating Accounts Receivable aging...</div>;
  }

  const buckets = [
    { label: "Current (0-30 Days)", value: report.current, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { label: "1 - 30 Days Overdue", value: report.days1_30, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { label: "31 - 60 Days Overdue", value: report.days31_60, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { label: "61 - 90 Days Overdue", value: report.days61_90, color: "text-orange-600 bg-orange-50 border-orange-200" },
    { label: "90+ Days Overdue", value: report.days90Plus, color: "text-red-600 bg-red-50 border-red-200" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" /> Accounts Receivable Aging Summary
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Chronological breakdown of outstanding invoice balances</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Receivables</p>
          <h4 className="text-xl font-black text-slate-900">${report.totalReceivables.toLocaleString("en-US", { minimumFractionDigits: 2 })}</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {buckets.map((b, idx) => (
          <div key={idx} className={`p-4 rounded-xl border ${b.color} flex flex-col justify-between`}>
            <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">{b.label}</p>
            <h4 className="text-lg font-black mt-2">${b.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}
