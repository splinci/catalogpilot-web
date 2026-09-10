"use client";

/**
 * ============================================================================
 * Splinci Commerce OS — Operations Analytics Workspace Page
 * ============================================================================
 * Specification Reference: M12-004 / UI-001
 * Executive Operational Analytics & Performance Trend Dashboard
 * ============================================================================
 */

import React from "react";
import { PageHero } from "@/components/layout/PageHero";
import { TrendingUp, RefreshCw } from "lucide-react";
import { useOperationsAnalytics } from "@/features/operations/hooks/useOperationsAnalytics";
import { OperationsReadinessCard } from "@/features/operations/components/OperationsReadinessCard";
import { OperationsDashboardCharts } from "@/features/operations/components/OperationsDashboardCharts";
import { LoadingSkeleton, ErrorState } from "@/features/operations/components/StateComponents";

export default function OperationsAnalyticsPage() {
  const { dashboard, trends, readiness, loading, error, refresh } = useOperationsAnalytics();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <PageHero title="Operations Analytics Workspace" description="Executive operational KPI trends, queue performance & readiness analytics" />
        <LoadingSkeleton title="Loading Operations Analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <PageHero title="Operations Analytics Workspace" description="Executive operational KPI trends, queue performance & readiness analytics" />
        <ErrorState message={error} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHero
        title="Operations Analytics Workspace"
        description="Executive operational KPI trends, outbox queue distribution & production readiness analytics"
        actions={
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
          </button>
        }
      />

      {/* Readiness Evaluation Card */}
      <OperationsReadinessCard readiness={readiness || dashboard?.readiness} />

      {/* Visual Analytics Charts */}
      <OperationsDashboardCharts metrics={dashboard?.metrics} incidentsSummary={dashboard?.incidentSummary} />

      {/* Trend Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-semibold uppercase">Outbox Queue Success Rate</span>
          <div className="text-2xl font-bold text-emerald-400">{trends?.kpis?.queueSuccessRate ?? 100}%</div>
          <p className="text-[11px] text-slate-500">Processed outbox event ratio</p>
        </div>

        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-semibold uppercase">AI Job Processing Success Rate</span>
          <div className="text-2xl font-bold text-blue-400">{trends?.kpis?.aiJobSuccessRate ?? 100}%</div>
          <p className="text-[11px] text-slate-500">AI catalog ingestion completion ratio</p>
        </div>

        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-semibold uppercase">Active User Sessions</span>
          <div className="text-2xl font-bold text-indigo-400">{trends?.kpis?.activeSessionsCount ?? 0}</div>
          <p className="text-[11px] text-slate-500">Currently active authenticated sessions</p>
        </div>
      </div>
    </div>
  );
}
