"use client";

import React, { useState } from "react";
import { Activity, Filter, RefreshCw, Play, XCircle } from "lucide-react";
import { useWorkflowExecutions } from "@/features/workflow/hooks/useWorkflowExecutions";
import {
  WorkflowExecutionTable,
  WorkflowExecutionDrawer,
  LoadingSkeleton,
  ErrorState,
  EmptyState,
} from "@/features/workflow/components";

export default function ExecutionsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedExecution, setSelectedExecution] = useState<any | null>(null);

  const {
    executions,
    isLoading,
    error,
    refetch,
    startExecution,
    retryExecution,
    cancelExecution,
  } = useWorkflowExecutions({ status: (selectedStatus || undefined) as any });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30">
            <Activity className="h-6 w-6 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Execution Monitoring Workspace</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time execution lifecycle tracking, step state inspection, & error resilience
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
            title="Refresh Executions"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <Filter className="h-3.5 w-3.5 text-purple-400" />
            <span>Filter Status:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors font-semibold"
          >
            <option value="">All Execution Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="RUNNING">RUNNING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="FAILED">FAILED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Main Execution Table */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => refetch()} />
      ) : executions.length === 0 ? (
        <EmptyState
          title="No Workflow Executions Found"
          description="No execution instances match the selected status filter."
          icon={Activity}
        />
      ) : (
        <WorkflowExecutionTable
          executions={executions}
          onSelect={(exec) => setSelectedExecution(exec)}
          onStart={(id) => startExecution(id)}
          onRetry={(id) => retryExecution(id)}
          onCancel={(id) => cancelExecution(id)}
        />
      )}

      {/* Detail Drawer */}
      <WorkflowExecutionDrawer
        execution={selectedExecution}
        onClose={() => setSelectedExecution(null)}
        onStart={(id) => startExecution(id)}
        onRetry={(id) => retryExecution(id)}
        onCancel={(id) => cancelExecution(id)}
      />
    </div>
  );
}
