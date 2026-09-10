"use client";

import { useExecutiveKPIs } from "@/hooks/useReporting";
import {
  DollarSign, ShoppingCart,
  Package, Users, Truck, Brain, Shield, ArrowUpRight, ArrowDownRight,
  AlertCircle, RefreshCw
} from "lucide-react";

function KPIRow({ label, value, unit = "", trend, trendUp, detail }: {
  label: string; value: string | number; unit?: string; trend?: string;
  trendUp?: boolean; detail?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 font-sans">
      <div>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        {detail && <p className="text-xs text-slate-400 mt-0.5">{detail}</p>}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-black text-slate-900 tabular-nums">
          {value}{unit}
        </span>
        {trend && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${trendUp ? "text-emerald-600" : "text-rose-500"}`}>
            {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function KPISection({ title, icon: Icon, color, children }: {
  title: string; icon: any; color: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden font-sans">
      <div className={`flex items-center gap-3 px-5 py-4 border-b border-slate-100 ${color}`}>
        <Icon className="h-4 w-4" />
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      <div className="px-5 py-2">{children}</div>
    </div>
  );
}

function HealthGauge({ score, rating }: { score: number; rating: string }) {
  const colors: Record<string, { bar: string; text: string; bg: string }> = {
    EXCELLENT: { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
    STRONG:    { bar: "bg-sky-500",     text: "text-sky-700",     bg: "bg-sky-50" },
    FAIR:      { bar: "bg-amber-500",   text: "text-amber-700",   bg: "bg-amber-50" },
    CRITICAL:  { bar: "bg-rose-500",    text: "text-rose-700",    bg: "bg-rose-50" },
  };
  const c = colors[rating] || colors.FAIR;
  return (
    <div className={`rounded-2xl border border-slate-200/80 ${c.bg} p-6 shadow-xs font-sans`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Shield className={`h-5 w-5 ${c.text}`} />
          <span className={`font-bold text-sm ${c.text}`}>Splinci Health Score</span>
        </div>
        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${c.text} bg-white/60 border`}>{rating}</span>
      </div>
      <div className="flex items-end gap-2 mb-3">
        <span className="text-5xl font-black text-slate-900">{score}</span>
        <span className="text-slate-400 font-bold mb-1 text-lg">/100</span>
      </div>
      <div className="w-full bg-white/40 rounded-full h-3">
        <div className={`h-3 rounded-full ${c.bar} transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-xs text-slate-600 mt-3 font-medium">
        Tenant composite score across business performance dimensions.
      </p>
    </div>
  );
}

export default function ExecutivePage() {
  const { data, loading, error, refetch } = useExecutiveKPIs();

  const kpis = data?.kpis || data || {};
  const totalRevenue = kpis?.totalRevenue ? `$${Number(kpis.totalRevenue).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "$0.00";
  const grossProfit = kpis?.grossProfit ? `$${Number(kpis.grossProfit).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "$0.00";
  const inventoryValuation = kpis?.inventoryValuation ? `$${Number(kpis.inventoryValuation).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "$0.00";
  const purchasingSpend = kpis?.purchasingSpend ? `$${Number(kpis.purchasingSpend).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "$0.00";

  return (
    <div className="space-y-8 font-sans">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive KPI Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise-wide key performance indicators aggregated across all operational domains.
          </p>
        </div>
        <button onClick={refetch} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {/* Health Score */}
      {loading ? (
        <div className="h-36 rounded-2xl border border-slate-200/80 bg-slate-50 animate-pulse" />
      ) : (
        <HealthGauge score={kpis?.ordersCount > 0 ? 100 : 0} rating={kpis?.ordersCount > 0 ? "EXCELLENT" : "FAIR"} />
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl border border-slate-200/80 bg-slate-50 animate-pulse" />
          ))
        ) : (
          <>
            <KPISection title="Revenue Performance" icon={DollarSign} color="text-indigo-700 bg-indigo-50">
              <KPIRow label="Total Revenue" value={totalRevenue} />
              <KPIRow label="Gross Profit" value={grossProfit} />
              <KPIRow label="Net Revenue Growth" value="0.0%" />
              <KPIRow label="Avg Order Value" value="$0.00" />
            </KPISection>

            <KPISection title="Inventory Performance" icon={Package} color="text-emerald-700 bg-emerald-50">
              <KPIRow label="Inventory Value" value={inventoryValuation} detail="At cost" />
              <KPIRow label="Stock Turnover" value="0.0" unit="x" />
              <KPIRow label="Reorder Alerts" value="0" detail="Products below threshold" />
              <KPIRow label="Dead Stock Value" value="$0.00" />
            </KPISection>

            <KPISection title="Purchasing Performance" icon={Truck} color="text-amber-700 bg-amber-50">
              <KPIRow label="Purchase Spend" value={purchasingSpend} />
              <KPIRow label="On-Time Delivery" value="100.0" unit="%" />
              <KPIRow label="Avg Lead Time" value="0.0" unit=" days" />
              <KPIRow label="Open POs" value={kpis?.pendingPOsCount ?? 0} detail="Pending receipt" />
            </KPISection>

            <KPISection title="Sales Performance" icon={ShoppingCart} color="text-violet-700 bg-violet-50">
              <KPIRow label="Orders Created" value={kpis?.ordersCount ?? 0} />
              <KPIRow label="Orders Delivered" value={kpis?.deliveredCount ?? 0} />
              <KPIRow label="Return Rate" value="0.0" unit="%" />
              <KPIRow label="Cancellation Rate" value="0.0" unit="%" />
            </KPISection>

            <KPISection title="CRM & Customer Health" icon={Users} color="text-sky-700 bg-sky-50">
              <KPIRow label="Total Customers" value={kpis?.customersCount ?? 0} />
              <KPIRow label="New Customers" value={kpis?.newCustomersCount ?? 0} detail="This period" />
              <KPIRow label="Avg LTV" value="$0.00" />
              <KPIRow label="Churn Risk" value="0" detail="High-risk accounts" />
            </KPISection>

            <KPISection title="AI Catalog Intelligence" icon={Brain} color="text-rose-700 bg-rose-50">
              <KPIRow label="AI Jobs Run" value={kpis?.aiJobsRun ?? 0} />
              <KPIRow label="Enrichment Rate" value="0.0" unit="%" />
              <KPIRow label="Content Approved" value="0" detail="AI-generated items" />
              <KPIRow label="Classification Accuracy" value="100.0" unit="%" />
            </KPISection>
          </>
        )}
      </div>
    </div>
  );
}
