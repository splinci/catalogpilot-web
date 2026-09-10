"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Zap,
  Layers,
  History,
  CheckCircle,
  Copy,
  Plus,
  RefreshCw,
  Power,
  ShieldCheck,
} from "lucide-react";
import { useWorkflow } from "@/features/workflow/hooks/useWorkflow";
import {
  WorkflowStatusBadge,
  WorkflowVersionTable,
  LoadingSkeleton,
  ErrorState,
} from "@/features/workflow/components";

export default function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { workflow, versions, isLoading, error, refetch, createVersion, publishVersion, cloneVersion } = useWorkflow(id);
  const [activeTab, setActiveTab] = useState<"overview" | "versions" | "triggers">("overview");

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <ErrorState message={error || "Workflow not found"} onRetry={() => refetch()} />
      </div>
    );
  }

  const rules = typeof workflow.rules === "object" ? workflow.rules : {};
  const triggers = rules.triggers || [];
  const steps = rules.steps || [];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back Link */}
      <Link
        href="/workflows"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Workflows</span>
      </Link>

      {/* Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-bold text-sm">
            {rules.code?.substring(0, 4) || "WF"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {rules.code || id.substring(0, 8)}
              </span>
              <WorkflowStatusBadge status={workflow.isActive ? "ACTIVE" : "INACTIVE"} size="sm" />
              <span className="text-xs font-mono text-slate-400">v{workflow.version || 1}</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">{workflow.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "overview"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          Overview & Steps
        </button>
        <button
          onClick={() => setActiveTab("versions")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "versions"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          Version History ({versions.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metadata & Config */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider">Workflow Configuration</h3>
            <div className="space-y-3 font-medium text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Type</span>
                <p className="font-mono text-indigo-400 font-bold mt-0.5">{workflow.workflowType}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Description</span>
                <p className="text-slate-300 mt-0.5">{rules.description || "No description specified."}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Max Retries</span>
                <p className="font-mono text-slate-200 mt-0.5">{rules.retryPolicy?.maxRetries ?? 3}</p>
              </div>
            </div>
          </div>

          {/* Steps list */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" /> Execution Pipeline Steps ({steps.length})
            </h3>
            <div className="space-y-3">
              {steps.map((s: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs">
                      {s.stepOrder || idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-100">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{s.stepType}</p>
                    </div>
                  </div>
                  {s.approvalRequired && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Approval
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "versions" && (
        <WorkflowVersionTable
          versions={versions}
          currentVersion={workflow.version}
          onPublish={(verNum) => publishVersion(verNum)}
          onClone={(verNum) => cloneVersion(verNum)}
        />
      )}
    </div>
  );
}
