"use client";

import React from "react";
import { Sparkles, Cpu } from "lucide-react";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { useAIDashboard } from "@/features/ai/hooks/useAIDashboard";
import { AIKPICards } from "@/features/ai/components/AIKPICards";
import { AIQuickLauncherGrid } from "@/features/ai/components/AIQuickLauncherGrid";
import { AIRecentJobsSummary } from "@/features/ai/components/AIRecentJobsSummary";

export default function AIDashboardPage() {
  const { dashboard, loading } = useAIDashboard();

  return (
    <div className="space-y-8 font-sans">
      <PageHero
        title="AI Catalog Intelligence Control Hub"
        description="Splinci Enterprise AI autonomous content generation, classification, enrichment, and batch execution suite."
        badge="Splinci AI Suite"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/ai/content"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:from-purple-500 hover:to-indigo-500 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-300" /> Content Studio
            </Link>
            <Link
              href="/ai/jobs"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-all shadow-md cursor-pointer"
            >
              <Cpu className="h-4 w-4 text-purple-400" /> Execution Queue
            </Link>
          </div>
        }
      />

      {/* KPI Overview Section */}
      <AIKPICards metrics={dashboard} loading={loading} />

      {/* Interactive AI Commerce Engines Grid */}
      <AIQuickLauncherGrid />

      {/* Real-time Job Queue Stream */}
      <AIRecentJobsSummary />
    </div>
  );
}
