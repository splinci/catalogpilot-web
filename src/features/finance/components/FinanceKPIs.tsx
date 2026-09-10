"use client";

import { DollarSign, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { FinanceMetrics } from "../hooks/useFinanceDashboard";

interface Props {
  metrics: FinanceMetrics | null;
  loading: boolean;
}

export function FinanceKPIs({ metrics, loading }: Props) {
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Revenue",
      value: `$${metrics.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      title: "Outstanding Receivables",
      value: `$${metrics.totalReceivables.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      title: "Paid Collections",
      value: `$${metrics.paidRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      title: "Overdue Invoices",
      value: metrics.overdueInvoicesCount,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50 border-red-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div key={idx} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.title}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.value}</h3>
            </div>
            <div className={`p-3 rounded-xl border ${kpi.color}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
