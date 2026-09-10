"use client";

import React from "react";
import Link from "next/link";
import { Eye, Play, RefreshCw, XCircle, ArrowUpRight } from "lucide-react";
import { WorkflowStatusBadge } from "./WorkflowStatusBadge";

interface WorkflowExecutionTableProps {
  executions: any[];
  onSelect?: (execution: any) => void;
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

export function WorkflowExecutionTable({
  executions,
  onSelect,
  onStart,
  onRetry,
  onCancel,
}: WorkflowExecutionTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            <th className="px-4 py-3.5">Execution ID</th>
            <th className="px-4 py-3.5">Trigger Event</th>
            <th className="px-4 py-3.5">Status</th>
            <th className="px-4 py-3.5">Started At</th>
            <th className="px-4 py-3.5 text-center">Duration</th>
            <th className="px-4 py-3.5 text-center">Retries</th>
            <th className="px-4 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-medium">
          {executions.map((exec) => {
            const status = exec.status || "PENDING";
            const retries = exec.retryCount ?? 0;
            const triggerEvent = formatTriggerEvent(exec.triggerEvent);

            return (
              <tr key={exec.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3.5">
                  <Link
                    href={`/workflows/executions/${exec.id}`}
                    className="font-mono font-bold text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>{exec.id.substring(0, 12)}...</span>
                    <ArrowUpRight className="h-3 w-3 text-slate-500" />
                  </Link>
                </td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-mono font-bold text-indigo-400 border border-indigo-500/20">
                    {triggerEvent}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <WorkflowStatusBadge status={status} size="sm" />
                </td>
                <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                  {exec.startedAt ? new Date(exec.startedAt).toLocaleString() : "Not Started"}
                </td>
                <td className="px-4 py-3.5 text-center font-mono text-slate-300">
                  {exec.durationMs ? `${exec.durationMs}ms` : "-"}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {retries}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {onSelect && (
                      <button
                        onClick={() => onSelect(exec)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-all"
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {status === "PENDING" && onStart && (
                      <button
                        onClick={() => onStart(exec.id)}
                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all"
                        title="Start Execution"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {status === "FAILED" && onRetry && (
                      <button
                        onClick={() => onRetry(exec.id)}
                        className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30 transition-all"
                        title="Retry Execution"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {(status === "PENDING" || status === "RUNNING") && onCancel && (
                      <button
                        onClick={() => onCancel(exec.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
                        title="Cancel Execution"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
