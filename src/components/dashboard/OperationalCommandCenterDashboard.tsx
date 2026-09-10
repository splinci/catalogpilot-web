"use client";

import { useState } from "react";
import Link from "next/link";
import { useDashboard } from "@/hooks/useDashboard";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Boxes,
  Truck,
  Building2,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Clock,
  Zap,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function OperationalCommandCenterDashboard() {
  const { data, loading, error, refresh } = useDashboard();
  const [activeRole, setActiveRole] = useState<"CEO" | "CATALOG" | "WAREHOUSE" | "PURCHASING" | "SALES">("CEO");

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
        <p className="text-xs text-slate-400">Loading Tenant Operational Command Center...</p>
      </div>
    );
  }

  const formattedRevenue = `$${(data?.totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedSnapshotRev = `$${Math.round(data?.totalRevenue || 0).toLocaleString("en-US")}`;

  const kpis = [
    { title: "Total Revenue", value: formattedRevenue, change: "+0.0%", isUp: true, source: "Finance", href: "/finance", icon: DollarSign, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { title: "Today's Orders", value: `${data?.totalOrders || 0}`, change: "0 orders", isUp: true, source: "Orders", href: "/orders", icon: ShoppingCart, color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
    { title: "Active Customers", value: `${data?.activeCustomers || 0}`, change: "0 new", isUp: true, source: "Customers", href: "/customers", icon: Users, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    { title: "Active Products", value: `${data?.totalProducts || 0}`, change: "Target 100%", isUp: true, source: "PIM Master", href: "/products", icon: Package, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
    { title: "Low Stock Items", value: `${data?.lowStock || 0}`, change: "Optimal", isUp: true, source: "Inventory", href: "/inventory", icon: Boxes, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { title: "Pending POs", value: `${data?.pendingPOs || 0}`, change: "$0 inbound", isUp: true, source: "Purchasing", href: "/purchasing", icon: Truck, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
    { title: "Warehouses", value: `${data?.warehousesCount || 0} Facilities`, change: "Operational", isUp: true, source: "WMS", href: "/warehouses", icon: Building2, color: "text-slate-300 bg-slate-800/60 border-slate-700" },
    { title: "AI Tasks", value: `${data?.aiQueuedTasks || 0} Executed`, change: "100% Ready", isUp: true, source: "PIM AI", href: "/catalog/ai/bulk", icon: Sparkles, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  ];

  const todaySnapshot = [
    { label: "Revenue", val: formattedSnapshotRev },
    { label: "Orders", val: `${data?.totalOrders || 0}` },
    { label: "Products Published", val: `${data?.publishedProducts || 0}` },
    { label: "POs Received", val: `${data?.receivedPOs || 0}` },
    { label: "Shipments Sent", val: `${data?.shipmentsSent || 0}` },
    { label: "New Customers", val: `${data?.activeCustomers || 0}` },
  ];

  const needsAttention: any[] = [];
  const liveTimeline: any[] = [];

  const quickActions = [
    { label: "+ Product", href: "/catalog/manual/single", primary: true },
    { label: "+ Sales Order", href: "/orders/new", primary: false },
    { label: "+ Customer", href: "/customers/new", primary: false },
    { label: "+ Purchase Order", href: "/purchasing", primary: false },
    { label: "+ Stock Adjustment", href: "/inventory", primary: false },
    { label: "+ Transfer Stock", href: "/warehouses", primary: false },
  ];

  return (
    <div className="space-y-7 pb-8 font-sans">
      {/* 1. EXECUTIVE HEADER & ROLE SELECTOR */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">
              👋 Operational Command Center
            </h1>
            <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
              v1.0 ONLINE
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            Splinci Commerce OS — Live Operational Command &amp; Actionable Intelligence.
          </p>
        </div>

        {/* Role View Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 text-xs font-bold backdrop-blur-md">
          {["CEO", "CATALOG", "WAREHOUSE", "PURCHASING", "SALES"].map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role as any)}
              className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                activeRole === role
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* 2. TODAY'S BUSINESS SNAPSHOT BAR */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl">
        <div className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-slate-400 mb-3 px-1">
          📊 Today's Business Performance Snapshot
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {todaySnapshot.map((snap) => (
            <div key={snap.label} className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 block truncate">{snap.label}</span>
              <span className="text-base font-black text-slate-100 block mt-0.5">{snap.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CLICKABLE EXECUTIVE KPI CARDS (8 DOMAIN CARDS) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.title}
              href={kpi.href}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-4 shadow-xl hover:border-slate-700/80 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400">
                  {kpi.source}
                </span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${kpi.color} group-hover:scale-110 transition-all`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-2">
                <div className="text-xl font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                  {kpi.value}
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="font-semibold text-slate-400">{kpi.title}</span>
                  <span className={`font-extrabold ${kpi.isUp ? "text-emerald-400" : "text-amber-400"}`}>
                    {kpi.change}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 4. "NEEDS YOUR ATTENTION" PRIORITY GATE & LIVE TIMELINE FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Needs Your Attention Widget */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Operational Action Gate
            </h3>
            <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              0 Critical Actions
            </span>
          </div>

          {needsAttention.length > 0 ? (
            <div className="space-y-2.5">
              {needsAttention.map((item) => (
                <Link
                  key={item.text}
                  href={item.href}
                  className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 flex items-center justify-between hover:border-indigo-500/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-lg border ${item.color}`}>
                      {item.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                      {item.text}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 rounded-xl bg-slate-950/60 border border-slate-800/80">
              All operational gates optimal. No urgent action items required.
            </div>
          )}
        </div>

        {/* Live Operations Feed Timeline */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-400" /> Live Operations Feed
            </h3>
            <span className="text-[10px] font-mono font-bold text-slate-400">Real-Time</span>
          </div>

          {liveTimeline.length > 0 ? (
            <div className="space-y-3.5 text-xs">
              {liveTimeline.map((tl) => (
                <div key={tl.time} className="flex items-start gap-3 border-l-2 border-indigo-500/30 pl-3">
                  <span className="font-mono text-[10px] font-bold text-slate-400 shrink-0">{tl.time}</span>
                  <div>
                    <p className="font-bold text-slate-200">{tl.text}</p>
                    <span className="text-[10px] text-indigo-400 font-semibold">{tl.domain}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 rounded-xl bg-slate-950/60 border border-slate-800/80">
              No recent operational events logged.
            </div>
          )}
        </div>
      </div>

      {/* 5. QUICK ACTIONS & SHORTCUTS */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-400" /> Quick Actions Navigation Shortcuts
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs font-bold">
          {quickActions.map((qa) => (
            <Link
              key={qa.label}
              href={qa.href}
              className={`rounded-xl px-4 py-3 text-center transition-all cursor-pointer ${
                qa.primary
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 active:scale-95"
                  : "bg-slate-950 text-slate-200 border border-slate-800 hover:bg-slate-800 hover:text-white active:scale-95"
              }`}
            >
              {qa.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
