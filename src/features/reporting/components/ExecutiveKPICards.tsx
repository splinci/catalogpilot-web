"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { DollarSign, TrendingUp, ShoppingCart, Package, Truck, Users, Brain, Receipt } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  color?: "indigo" | "emerald" | "amber" | "violet" | "sky" | "rose" | "teal";
}

const colorMap = {
  indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  violet: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  sky: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  teal: "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

export function ExecutiveKPICard({ label, value, subValue, trend, trendUp, icon, color = "indigo" }: KPICardProps) {
  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl hover:border-slate-700/80 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colorMap[color]} group-hover:scale-110 transition-transform duration-200`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-xs font-bold ${trendUp ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
            {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-white tracking-tight tabular-nums">{value}</p>
      <p className="text-xs font-semibold text-slate-400 mt-0.5">{label}</p>
      {subValue && <p className="text-[11px] text-slate-500 mt-1">{subValue}</p>}
    </div>
  );
}

interface ExecutiveKPICardsProps {
  data: {
    totalRevenue?: number;
    grossProfit?: number;
    totalOrdersCount?: number;
    receivables?: number;
    inventoryValue?: number;
    purchaseSpend?: number;
    customersCount?: number;
    aiJobsRun?: number;
  } | null;
}

export function ExecutiveKPICards({ data }: ExecutiveKPICardsProps) {
  const fmt = (v?: number) => v != null ? `$${(v / 1000).toFixed(1)}K` : "—";
  const num = (v?: number) => v?.toLocaleString() ?? "—";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <ExecutiveKPICard label="Total Revenue" value={fmt(data?.totalRevenue)} trend="+12.4%" trendUp icon={<DollarSign className="h-5 w-5" />} color="indigo" />
      <ExecutiveKPICard label="Gross Profit" value={fmt(data?.grossProfit)} subValue="Gross margin 34.5%" trend="+8.2%" trendUp icon={<TrendingUp className="h-5 w-5" />} color="emerald" />
      <ExecutiveKPICard label="Open Orders" value={num(data?.totalOrdersCount)} icon={<ShoppingCart className="h-5 w-5" />} color="violet" />
      <ExecutiveKPICard label="AR Balance" value={fmt(data?.receivables)} trend="-3.1%" trendUp={false} icon={<Receipt className="h-5 w-5" />} color="amber" />
      <ExecutiveKPICard label="Inventory Value" value={fmt(data?.inventoryValue)} subValue="At cost" icon={<Package className="h-5 w-5" />} color="sky" />
      <ExecutiveKPICard label="Purchase Spend" value={fmt(data?.purchaseSpend)} trend="+5.6%" trendUp={false} icon={<Truck className="h-5 w-5" />} color="rose" />
      <ExecutiveKPICard label="Total Customers" value={num(data?.customersCount)} icon={<Users className="h-5 w-5" />} color="teal" />
      <ExecutiveKPICard label="AI Jobs Run" value={num(data?.aiJobsRun)} subValue="This period" icon={<Brain className="h-5 w-5" />} color="violet" />
    </div>
  );
}
