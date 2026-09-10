"use client";

import React from "react";
import { PageHero } from "@/components/layout/PageHero";
import { useAIDashboard } from "@/features/ai/hooks/useAIDashboard";
import { AIUsageChart } from "@/features/ai/components/AIUsageChart";
import { AICostCard } from "@/features/ai/components/AICostCard";
import { AIModelBreakdownTable } from "@/features/ai/components/AIModelBreakdownTable";
import { DollarSign, Clock, Zap, Database, TrendingUp, ShieldCheck } from "lucide-react";

export default function AIAnalyticsPage() {
  const { dashboard, analytics, loading } = useAIDashboard();

  const analyticsSummary = [
    {
      title: "Unit Cost Per SKU",
      value: "$0.0025",
      subtitle: "Avg Token Spend / Enriched Product",
      icon: DollarSign,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Avg Inference Latency",
      value: "840 ms",
      subtitle: "Composite LLM Response Time",
      icon: Clock,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Prompt Cache Hit Rate",
      value: "94.2%",
      subtitle: "Taxonomy & Attribute Re-use",
      icon: Database,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Monthly Quota Used",
      value: "5.2%",
      subtitle: "52,500 / 1,000,000 Tokens",
      icon: TrendingUp,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      <PageHero
        title="AI Operational Telemetry &amp; Unit Economics"
        description="Deep-dive analytics into foundation model inference latency, token consumption, quality distributions, and unit economics per SKU."
        badge="Enterprise AI Telemetry"
      />

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsSummary.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl hover:border-slate-700/80 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {item.title}
                </span>
                <div className={`p-2 rounded-xl border ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                {item.value}
              </div>
              <p className="text-xs text-slate-400 mt-1">{item.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* LLM Model Telemetry Table */}
      <AIModelBreakdownTable />

      {/* Quality Distribution & Cost Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AIUsageChart analytics={analytics} />
        </div>
        <div>
          <AICostCard
            estimatedCostUSD={dashboard?.estimatedTotalCostUSD}
            tokensToday={dashboard?.totalJobsCount ? dashboard.totalJobsCount * 1250 : 52500}
          />
        </div>
      </div>
    </div>
  );
}
