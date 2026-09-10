"use client";

import React from "react";
import { BarChart3, RefreshCw, Zap } from "lucide-react";
import { useWorkflowAnalytics } from "@/features/workflow/hooks/useWorkflowAnalytics";
import { useWorkflowTriggers } from "@/features/workflow/hooks/useWorkflowTriggers";
import {
  WorkflowAnalyticsCards,
  WorkflowDashboardCharts,
  WorkflowTriggerPanel,
  LoadingSkeleton,
  ErrorState,
} from "@/features/workflow/components";

export default function AnalyticsPage() {
  const { analytics, dashboard, isLoading, error, refetch } = useWorkflowAnalytics();
  const { evaluateTriggers, processTriggerEvent } = useWorkflowTriggers();

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
            <BarChart3 className="h-6 w-6 text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Workflow Analytics</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Operational metrics, execution throughput, failure rates, & event simulation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
            title="Refresh Analytics"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <>
          {/* KPI Summary Cards */}
          <WorkflowAnalyticsCards summary={analytics?.summary} />

          {/* Visual Charts */}
          <WorkflowDashboardCharts breakdown={analytics?.breakdown} />

          {/* Event Trigger Tester */}
          <div className="pt-4">
            <WorkflowTriggerPanel
              onEvaluate={(evt, payload) => evaluateTriggers(evt, payload)}
              onProcess={(evt, payload) => processTriggerEvent(evt, payload)}
            />
          </div>
        </>
      )}
    </div>
  );
}
