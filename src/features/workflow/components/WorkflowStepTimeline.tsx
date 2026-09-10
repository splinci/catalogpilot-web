"use client";

import React from "react";
import { CheckCircle2, XCircle, Clock, SkipForward, AlertTriangle } from "lucide-react";
import { WorkflowStatusBadge } from "./WorkflowStatusBadge";

interface WorkflowStepTimelineProps {
  steps: any[];
}

export function WorkflowStepTimeline({ steps }: WorkflowStepTimelineProps) {
  if (!steps || steps.length === 0) {
    return <p className="text-xs text-slate-400 italic">No steps recorded in execution.</p>;
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
      {steps.map((step, idx) => {
        const status = (step.status || "PENDING").toUpperCase();
        let Icon = Clock;
        let iconBg = "bg-amber-500/20 text-amber-400 border-amber-500/30";

        if (status === "COMPLETED") {
          Icon = CheckCircle2;
          iconBg = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
        } else if (status === "FAILED") {
          Icon = XCircle;
          iconBg = "bg-rose-500/20 text-rose-400 border-rose-500/30";
        } else if (status === "SKIPPED") {
          Icon = SkipForward;
          iconBg = "bg-sky-500/20 text-sky-400 border-sky-500/30";
        }

        return (
          <div key={step.id || idx} className="relative group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-6 top-0 flex h-5 w-5 items-center justify-center rounded-full border ${iconBg}`}
            >
              <Icon className="h-3 w-3" />
            </div>

            {/* Card details */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{step.stepName || step.name || `Step ${idx + 1}`}</span>
                <WorkflowStatusBadge status={status} size="sm" />
              </div>

              <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                {step.durationMs !== undefined && <span>Duration: {step.durationMs}ms</span>}
                {step.retryCount !== undefined && step.retryCount > 0 && (
                  <span className="text-purple-400">Retries: {step.retryCount}</span>
                )}
              </div>

              {step.error && (
                <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-start gap-1.5 font-mono">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{typeof step.error === "string" ? step.error : JSON.stringify(step.error)}</span>
                </div>
              )}

              {step.output && (
                <pre className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 overflow-x-auto">
                  {JSON.stringify(step.output, null, 2)}
                </pre>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
