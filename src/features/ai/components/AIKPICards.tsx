"use client";

import React from "react";
import { Cpu, CheckCircle2, AlertTriangle, Sparkles, Award, ShieldCheck, DollarSign, Layers } from "lucide-react";

interface AIKPICardsProps {
  metrics?: {
    totalJobsCount?: number;
    successfulJobsCount?: number;
    failedJobsCount?: number;
    averageQualityScore?: number;
    averageConfidenceScore?: number;
    humanApprovalRate?: number;
    autoApprovalRate?: number;
    estimatedTotalCostUSD?: number;
    generatedProductsCount?: number;
    bulkJobsCount?: number;
  } | null;
  loading?: boolean;
}

export const AIKPICards: React.FC<AIKPICardsProps> = ({ metrics, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
        ))}
      </div>
    );
  }

  const hasData = (metrics?.totalJobsCount ?? 0) > 0;

  const kpis = [
    {
      title: "Total AI Jobs",
      value: metrics?.totalJobsCount ?? 0,
      subtitle: `${metrics?.bulkJobsCount ?? 0} Bulk Batches`,
      icon: Cpu,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Success Rate",
      value: hasData ? `${Math.round(((metrics?.successfulJobsCount ?? 0) / (metrics?.totalJobsCount ?? 1)) * 100)}%` : "—",
      subtitle: `${metrics?.successfulJobsCount ?? 0} Succeeded, ${metrics?.failedJobsCount ?? 0} Failed`,
      icon: CheckCircle2,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Average Quality",
      value: hasData ? `${metrics?.averageQualityScore ?? 0}/100` : "—",
      subtitle: "Enterprise Catalog Standard",
      icon: Award,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Average Confidence",
      value: hasData ? `${Math.round((metrics?.averageConfidenceScore ?? 0) * 100)}%` : "—",
      subtitle: "Composite AI Certainty",
      icon: Sparkles,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Auto Approval Rate",
      value: hasData ? `${metrics?.autoApprovalRate ?? 0}%` : "—",
      subtitle: `Manual Review: ${metrics?.humanApprovalRate ?? 0}%`,
      icon: ShieldCheck,
      color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
    {
      title: "Generated Products",
      value: metrics?.generatedProductsCount ?? 0,
      subtitle: "Enriched & Published SKUs",
      icon: Layers,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "AI Cost Today",
      value: `$${(metrics?.estimatedTotalCostUSD ?? 0).toFixed(2)}`,
      subtitle: "Token Unit Economics",
      icon: DollarSign,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Failed Jobs",
      value: metrics?.failedJobsCount ?? 0,
      subtitle: "Ready for Auto Retry",
      icon: AlertTriangle,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl hover:border-slate-700/80 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {kpi.title}
              </span>
              <div className={`p-2 rounded-xl border ${kpi.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors">
              {kpi.value}
            </div>
            <p className="text-xs text-slate-400 mt-1">{kpi.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
};
