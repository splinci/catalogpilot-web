"use client";

import { Package, AlertTriangle, TrendingUp } from "lucide-react";

interface InventorySummaryCardProps {
  totalValue?: number;
  totalUnits?: number;
  turnoverRatio?: number;
  reorderCount?: number;
  skuCount?: number;
}

function StatRow({ label, value, icon: Icon, highlight }: { label: string; value: string; icon: any; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-3 border-b border-slate-100 last:border-0 ${highlight ? "text-rose-600" : ""}`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${highlight ? "text-rose-400" : "text-slate-400"}`} />
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      </div>
      <span className={`font-black tabular-nums text-sm ${highlight ? "text-rose-600" : "text-slate-900"}`}>{value}</span>
    </div>
  );
}

export function InventorySummaryCard({ totalValue, totalUnits, turnoverRatio, reorderCount, skuCount }: InventorySummaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-emerald-50">
        <Package className="h-4 w-4 text-emerald-600" />
        <h3 className="font-bold text-sm text-emerald-700">Inventory Summary</h3>
      </div>
      <div className="px-5 py-2">
        <StatRow label="Total Inventory Value" value={totalValue != null ? `$${(totalValue / 1000).toFixed(1)}K` : "—"} icon={Package} />
        <StatRow label="Total Units on Hand" value={totalUnits?.toLocaleString() ?? "—"} icon={Package} />
        <StatRow label="Active SKUs" value={skuCount?.toLocaleString() ?? "—"} icon={Package} />
        <StatRow label="Stock Turnover Ratio" value={turnoverRatio != null ? `${turnoverRatio.toFixed(1)}x` : "—"} icon={TrendingUp} />
        <StatRow label="Reorder Candidates" value={reorderCount?.toString() ?? "—"} icon={AlertTriangle} highlight={(reorderCount ?? 0) > 0} />
      </div>
    </div>
  );
}
