"use client";

import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { useDashboard } from "@/hooks/useDashboard";
import {
  Package,
  FileText,
  Archive,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Plus,
  Boxes,
  Loader2,
} from "lucide-react";

export default function PimDashboardPage() {
  const { data, loading } = useDashboard();

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
        <p className="text-xs text-slate-400">Loading Product Catalog Dashboard...</p>
      </div>
    );
  }

  const activeCount = data?.publishedProducts || data?.totalProducts || 0;

  const stats = [
    { label: "Active Master Products", value: `${activeCount}`, change: "Tenant Scoped", icon: Package, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
    { label: "Draft Products", value: "0", change: "Staged in Studio", icon: FileText, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { label: "Pending Approval", value: "0", change: "Needs QA review", icon: Clock, color: "text-purple-600 bg-purple-50 border-purple-200" },
    { label: "Recently Published", value: `${data?.publishedProducts || 0}`, change: "Last 7 days", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { label: "Archived Products", value: "0", change: "Legacy SKUs", icon: Archive, color: "text-slate-600 bg-slate-100 border-slate-200" },
  ];

  return (
    <div className="space-y-8 font-sans">
      <PageHero
        title="Product Catalog (PIM) Dashboard"
        description="Executive PIM command center. Real-time metrics on product master data, quality scores, AI confidence distribution, and Catalog Studio approval queues."
        actions={
          <div className="flex items-center gap-3">
            <Link href="/catalog/create">
              <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                <Plus className="h-4 w-4" />
                <span>Create Products</span>
              </button>
            </Link>
            <Link href="/catalog/workspace">
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-all cursor-pointer">
                <Boxes className="h-4 w-4 text-indigo-400" />
                <span>Catalog Studio (0)</span>
              </button>
            </Link>
          </div>
        }
      />

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{item.label}</span>
                <span className={`flex h-8 w-8 items-center justify-center rounded-xl border ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900">{item.value}</div>
              <div className="text-xs font-semibold text-slate-500">{item.change}</div>
            </div>
          );
        })}
      </div>

      {/* Quality Score & AI Confidence Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quality Score Health Widget */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <span>PIM Quality Score Overview</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Catalog data completeness &amp; validation pass rate</p>
            </div>
            <span className="font-mono text-sm font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {activeCount > 0 ? "100.0% Avg" : "0.0% Avg"}
            </span>
          </div>

          {activeCount > 0 ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Excellent Quality (90% - 100%)</span>
                  <span>100% ({activeCount} SKUs)</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
              No catalog products available to evaluate data quality completeness.
            </div>
          )}
        </div>

        {/* AI Confidence Distribution Widget */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span>AI Field Confidence Distribution</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Confidence accuracy across AI-assisted extractions</p>
            </div>
            <span className="font-mono text-sm font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              0.0% Avg
            </span>
          </div>

          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
            No AI extraction events recorded for this tenant.
          </div>
        </div>
      </div>
    </div>
  );
}
