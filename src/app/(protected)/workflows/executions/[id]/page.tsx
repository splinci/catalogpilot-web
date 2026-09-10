"use client";

import React, { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  Play,
  RefreshCw,
  XCircle,
  Code,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useWorkflowExecutions } from "@/features/workflow/hooks/useWorkflowExecutions";
import { useWorkflowApprovals } from "@/features/workflow/hooks/useWorkflowApprovals";
import {
  WorkflowStatusBadge,
  WorkflowStepTimeline,
  WorkflowApprovalPanel,
  LoadingSkeleton,
  ErrorState,
} from "@/features/workflow/components";

export default function ExecutionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [execution, setExecution] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { startExecution, retryExecution, cancelExecution } = useWorkflowExecutions();
  const { approveExecution, rejectExecution, expireExecution } = useWorkflowApprovals();

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/workflows/executions/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch execution detail");
      }
      setExecution(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to load execution");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (error || !execution) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <ErrorState message={error || "Execution not found"} onRetry={fetchDetail} />
      </div>
    );
  }

  const status = execution.status || "PENDING";
  const steps = execution.stepExecutions || execution.steps || [];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back link */}
      <Link
        href="/workflows/executions"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Executions</span>
      </Link>

      {/* Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-bold text-xs">
            EXEC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {id}
              </span>
              <WorkflowStatusBadge status={status} size="sm" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight mt-1 font-mono">
              Trigger: {execution.triggerEvent || "MANUAL_TRIGGER"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {status === "PENDING" && (
            <button
              onClick={async () => {
                await startExecution(id);
                fetchDetail();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
            >
              <Play className="h-3.5 w-3.5" /> Start Execution
            </button>
          )}
          {status === "FAILED" && (
            <button
              onClick={async () => {
                await retryExecution(id);
                fetchDetail();
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry Execution
            </button>
          )}
          {(status === "PENDING" || status === "RUNNING") && (
            <button
              onClick={async () => {
                await cancelExecution(id);
                fetchDetail();
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition-all"
            >
              <XCircle className="h-3.5 w-3.5" /> Cancel Execution
            </button>
          )}
          <button
            onClick={fetchDetail}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Approval Banner Panel if status requires decision */}
      {(status === "PENDING" || status === "RUNNING") && (
        <WorkflowApprovalPanel
          executionId={id}
          onApprove={async (execId, notes) => {
            await approveExecution(execId, notes);
            fetchDetail();
          }}
          onReject={async (execId, reason) => {
            await rejectExecution(execId, reason);
            fetchDetail();
          }}
          onExpire={async (execId, reason) => {
            await expireExecution(execId, reason);
            fetchDetail();
          }}
        />
      )}

      {/* Grid: Payload & Metadata vs Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Metadata & Payload */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider">Execution Metadata</h3>
            <div className="space-y-2 text-slate-300 font-medium">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Started</span>
                <p className="mt-0.5">{execution.startedAt ? new Date(execution.startedAt).toLocaleString() : "Not Started"}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Completed</span>
                <p className="mt-0.5">{execution.completedAt ? new Date(execution.completedAt).toLocaleString() : "In Progress"}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Duration</span>
                <p className="font-mono text-slate-200 mt-0.5">{execution.durationMs ? `${execution.durationMs}ms` : "-"}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Retries</span>
                <p className="font-mono text-slate-200 mt-0.5">{execution.retryCount ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Code className="h-4 w-4 text-indigo-400" /> Trigger Payload
            </h3>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
              {JSON.stringify(execution.payload || {}, null, 2)}
            </pre>
          </div>
        </div>

        {/* Right column: Step Timeline */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Step Execution Timeline ({steps.length})
          </h3>
          <WorkflowStepTimeline steps={steps} />
        </div>
      </div>
    </div>
  );
}
