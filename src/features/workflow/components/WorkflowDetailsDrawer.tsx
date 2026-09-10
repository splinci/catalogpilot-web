"use client";

import React from "react";
import { X, Zap, Layers, RefreshCw, Calendar, Code, ShieldCheck } from "lucide-react";
import { WorkflowStatusBadge } from "./WorkflowStatusBadge";

interface WorkflowDetailsDrawerProps {
  workflow: any | null;
  onClose: () => void;
}

export function WorkflowDetailsDrawer({ workflow, onClose }: WorkflowDetailsDrawerProps) {
  if (!workflow) return null;

  const rules = typeof workflow.rules === "object" ? workflow.rules : {};
  const triggers = rules.triggers || [];
  const steps = rules.steps || [];
  const retryPolicy = rules.retryPolicy || { maxRetries: 3, backoffSeconds: 60 };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 text-slate-100 h-full overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {rules.code || workflow.id.substring(0, 8)}
              </span>
              <WorkflowStatusBadge status={workflow.isActive ? "ACTIVE" : "INACTIVE"} size="sm" />
            </div>
            <h2 className="text-lg font-black text-slate-100 tracking-tight mt-1.5">{workflow.name}</h2>
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
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Workflow Type
              </span>
              <p className="font-mono text-slate-200 font-bold mt-0.5">{workflow.workflowType}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Version
              </span>
              <p className="font-mono text-slate-200 font-bold mt-0.5">v{workflow.version || 1}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Created
              </span>
              <p className="text-slate-300 mt-0.5">
                {workflow.createdAt ? new Date(workflow.createdAt).toLocaleString() : "N/A"}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Last Updated
              </span>
              <p className="text-slate-300 mt-0.5">
                {workflow.updatedAt ? new Date(workflow.updatedAt).toLocaleString() : "N/A"}
              </p>
            </div>
          </div>

          {/* Triggers */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Configured Triggers ({triggers.length})</span>
            </h3>
            {triggers.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No automated triggers configured.</p>
            ) : (
              <div className="space-y-2">
                {triggers.map((t: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-300">{t.eventType}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">{t.triggerType}</span>
                    </div>
                    {t.conditions && (
                      <pre className="mt-2 text-[10px] font-mono text-slate-400 bg-slate-950 p-2 rounded border border-slate-800 overflow-x-auto">
                        {JSON.stringify(t.conditions, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              <span>Execution Steps ({steps.length})</span>
            </h3>
            {steps.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No execution steps configured.</p>
            ) : (
              <div className="space-y-2">
                {steps.map((s: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[11px]">
                        {s.stepOrder || i + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-200">{s.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{s.stepType}</p>
                      </div>
                    </div>
                    {s.approvalRequired && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Approval Required
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Retry Policy */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 text-purple-400" />
              <span>Retry & Resilience Policy</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
              <div>
                Max Retries: <span className="font-bold text-slate-200 font-mono">{retryPolicy.maxRetries ?? 3}</span>
              </div>
              <div>
                Backoff: <span className="font-bold text-slate-200 font-mono">{retryPolicy.backoffSeconds ?? 60}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
