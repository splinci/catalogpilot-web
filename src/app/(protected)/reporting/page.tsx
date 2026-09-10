"use client";

import Link from "next/link";
import {
  BarChart3, TrendingUp, Package, Truck, DollarSign,
  Users, Activity, CalendarClock, ChevronRight, Sparkles
} from "lucide-react";

const workspaces = [
  { href: "/reporting/dashboard",  label: "Executive Dashboard",  desc: "Cross-domain KPIs, health score, and trend snapshots", icon: Activity,      color: "indigo" },
  { href: "/reporting/sales",      label: "Sales Analytics",       desc: "Revenue, orders, top products & customer ranking",   icon: TrendingUp,    color: "violet" },
  { href: "/reporting/inventory",  label: "Inventory Intelligence",desc: "Valuation, turnover, reorder & slow-mover analysis", icon: Package,       color: "emerald" },
  { href: "/reporting/purchasing", label: "Purchasing Analytics",  desc: "Supplier scorecards, spend, & receiving performance", icon: Truck,         color: "amber" },
  { href: "/reporting/finance",    label: "Finance Reports",       desc: "Revenue, AR aging, collections & profitability",     icon: DollarSign,    color: "violet" },
  { href: "/reporting/crm",        label: "CRM Analytics",         desc: "Growth, retention, LTV, segmentation & credit risk", icon: Users,         color: "sky" },
  { href: "/reporting/analytics",  label: "Advanced Analytics",    desc: "Growth rates, trends, benchmarks & health scoring",  icon: BarChart3,     color: "rose" },
  { href: "/reporting/scheduled",  label: "Scheduled Reports",     desc: "Automate report delivery to stakeholders",           icon: CalendarClock, color: "teal" },
];

const colorMap: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-100",
  violet: "bg-violet-50 text-violet-600 border-violet-100 group-hover:bg-violet-100",
  emerald:"bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-100",
  amber:  "bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-100",
  sky:    "bg-sky-50 text-sky-600 border-sky-100 group-hover:bg-sky-100",
  rose:   "bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-100",
  teal:   "bg-teal-50 text-teal-600 border-teal-100 group-hover:bg-teal-100",
};

export default function ReportingIndexPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-950 to-indigo-950 p-8 text-white shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.3),_transparent_60%)]" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-indigo-300" />
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Splinci Commerce OS</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Business Intelligence Hub</h1>
          <p className="text-slate-300 max-w-xl text-sm leading-relaxed">
            Enterprise executive reporting across Sales, Inventory, Purchasing, Finance, CRM, and AI domains. 
            Real-time dashboards powered by the M10-003 REST API layer.
          </p>
        </div>
      </div>

      {/* Workspace Grid */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Report Workspaces</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {workspaces.map((ws) => {
            const Icon = ws.icon;
            return (
              <Link
                key={ws.href}
                href={ws.href}
                className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border mb-4 transition-colors ${colorMap[ws.color]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-indigo-700 transition-colors">{ws.label}</h3>
                <p className="text-xs text-slate-500 flex-1">{ws.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-slate-400 group-hover:text-indigo-500 transition-colors">
                  Open workspace <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
