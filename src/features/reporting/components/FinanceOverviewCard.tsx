"use client";

import { DollarSign, TrendingUp, Receipt, CreditCard } from "lucide-react";

interface FinanceOverviewCardProps {
  totalRevenue?: number;
  grossProfit?: number;
  grossMarginPercent?: number;
  netProfit?: number;
  netMarginPercent?: number;
  receivables?: number;
  collectionRate?: number;
}

function MetricRow({ label, value, sub, icon: Icon, highlight = false }: {
  label: string; value: string; sub?: string; icon: any; highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2.5">
        <Icon className={`h-4 w-4 ${highlight ? "text-emerald-500" : "text-slate-400"}`} />
        <div>
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          {sub && <p className="text-xs text-slate-400">{sub}</p>}
        </div>
      </div>
      <span className={`font-black tabular-nums text-sm ${highlight ? "text-emerald-600" : "text-slate-900"}`}>{value}</span>
    </div>
  );
}

export function FinanceOverviewCard({
  totalRevenue, grossProfit, grossMarginPercent, netProfit, netMarginPercent, receivables, collectionRate
}: FinanceOverviewCardProps) {
  const fmt = (v?: number) => v != null ? `$${(v / 1000).toFixed(1)}K` : "—";
  const pct = (v?: number) => v != null ? `${v.toFixed(1)}%` : "—";

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-violet-50">
        <DollarSign className="h-4 w-4 text-violet-600" />
        <h3 className="font-bold text-sm text-violet-700">Finance Overview</h3>
      </div>
      <div className="px-5 py-2">
        <MetricRow label="Total Revenue" value={fmt(totalRevenue)} icon={DollarSign} />
        <MetricRow label="Gross Profit" value={fmt(grossProfit)} sub={grossMarginPercent != null ? `${grossMarginPercent.toFixed(1)}% margin` : undefined} icon={TrendingUp} highlight />
        <MetricRow label="Net Profit" value={fmt(netProfit)} sub={netMarginPercent != null ? `${netMarginPercent.toFixed(1)}% net margin` : undefined} icon={TrendingUp} />
        <MetricRow label="Accounts Receivable" value={fmt(receivables)} icon={Receipt} />
        <MetricRow label="Collection Rate" value={pct(collectionRate)} icon={CreditCard} highlight={(collectionRate ?? 0) > 85} />
      </div>
    </div>
  );
}
