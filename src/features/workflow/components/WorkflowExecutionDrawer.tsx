"use client";

import React from "react";
import { X, Play, RefreshCw, XCircle, Code, ShieldCheck } from "lucide-react";
import { WorkflowStatusBadge } from "./WorkflowStatusBadge";
import { WorkflowStepTimeline } from "./WorkflowStepTimeline";

interface WorkflowExecutionDrawerProps {
  execution: any | null;
  onClose: () => void;
  onStart?: (id: string) => void;
  onRetry?: (id: string) => void;
  onCancel?: (id: string) => void;
}

const formatTriggerEvent = (evt: any): string => {
  if (!evt) return "MANUAL_TRIGGER";
  if (typeof evt === "object" && evt.event) return evt.event;
  if (typeof evt === "string") {
    const trimmed = evt.trim();
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && parsed.event) return parsed.event;
      } catch {
        // Fallback
      }
    }
    return evt;
  }
  return String(evt);
};

export function WorkflowExecutionDrawer({
  execution,
  onClose,
  onStart,
  onRetry,
  onCancel,
}: WorkflowExecutionDrawerProps) {
  if (!execution) return null;

  const steps = execution.stepExecutions || execution.steps || [];
  const status = execution.status || "PENDING";
  const triggerEvent = formatTriggerEvent(execution.triggerEvent);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 text-slate-100 h-full overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-400 font-bold">Execution ID:</span>
              <span className="font-mono text-xs font-bold text-indigo-400">{execution.id}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <WorkflowStatusBadge status={status} size="sm" />
              <span className="text-xs font-mono text-slate-300">
                Trigger: {triggerEvent}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Actions Bar */}
          <div className="flex items-center justify-end gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            {status === "PENDING" && onStart && (
              <button
                onClick={() => onStart(execution.id)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <Play className="h-3.5 w-3.5" /> Start Execution
              </button>
            )}
            {status === "FAILED" && onRetry && (
              <button
                onClick={() => onRetry(execution.id)}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Retry Execution
              </button>
            )}
            {(status === "PENDING" || status === "RUNNING") && onCancel && (
              <button
                onClick={() => onCancel(execution.id)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20"
              >
                <XCircle className="h-3.5 w-3.5" /> Cancel Execution
              </button>
            )}
          </div>

          {/* Execution Metadata */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Started</span>
              <p className="text-slate-200 mt-0.5">
                {execution.startedAt ? new Date(execution.startedAt).toLocaleString() : "Not Started"}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Completed</span>
              <p className="text-slate-200 mt-0.5">
                {execution.completedAt ? new Date(execution.completedAt).toLocaleString() : "Running / Pending"}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Duration</span>
              <p className="font-mono text-slate-200 font-bold mt-0.5">
                {execution.durationMs ? `${execution.durationMs}ms` : "-"}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Retry Count</span>
              <p className="font-mono text-slate-200 font-bold mt-0.5">
                {execution.retryCount ?? 0}
              </p>
            </div>
          </div>

          {/* Trigger Payload */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Code className="h-4 w-4 text-indigo-400" /> Trigger Payload
            </h3>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
              {JSON.stringify(execution.payload || {}, null, 2)}
            </pre>
          </div>

          {/* Step Execution Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Step Execution Timeline
            </h3>
            <WorkflowStepTimeline steps={steps} />
          </div>
        </div>
      </div>
    </div>
  );
}
