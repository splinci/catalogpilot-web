/**
 * ============================================================================
 * Splinci Commerce OS — OperationsKPICards Component
 * ============================================================================
 * Specification Reference: M12-004 / UI-001
 * Displays enterprise operational performance & readiness KPI cards
 * ============================================================================
 */

import React from "react";
import { Activity, AlertOctagon, CheckCircle2, Cpu, Inbox, ShieldAlert, Workflow, Bell } from "lucide-react";

export function OperationsKPICards({
  readiness,
  telemetry,
  metrics,
  incidentsSummary,
}: {
  readiness?: any;
  telemetry?: any;
  metrics?: any;
  incidentsSummary?: any;
}) {
  const readinessScore = readiness?.score ?? 100;
  const healthStatus = telemetry?.status ?? "HEALTHY";
  const criticalCount = incidentsSummary?.bySeverity?.critical ?? 0;
  const totalIncidents = incidentsSummary?.totalIncidents ?? 0;
  const outboxFailed = metrics?.outbox?.failedCount ?? 0;
  const aiJobFailed = metrics?.aiJobs?.failedCount ?? 0;
  const wfExecutions = metrics?.workflows?.totalExecutions ?? 0;
  const unreadAlerts = metrics?.alerts?.unreadCount ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Production Readiness Score */}
      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Production Readiness</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-100">{readinessScore}%</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                readiness?.status === "READY"
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : readiness?.status === "DEGRADED"
                  ? "bg-amber-950 text-amber-400 border border-amber-800"
                  : "bg-red-950 text-red-400 border border-red-800"
              }`}
            >
              {readiness?.status || "READY"}
            </span>
          </div>
        </div>
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* 2. Platform System Health */}
      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">System Health</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-100">{healthStatus}</span>
            <span className="text-xs text-slate-400">{telemetry?.databaseLatencyMs ?? 0}ms DB</span>
          </div>
        </div>
        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
          <Activity className="w-6 h-6" />
        </div>
      </div>

      {/* 3. Critical Incidents */}
      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Incidents / Critical</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-bold ${criticalCount > 0 ? "text-red-400" : "text-slate-100"}`}>
              {criticalCount}
            </span>
            <span className="text-xs text-slate-400">of {totalIncidents} total</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl ${criticalCount > 0 ? "bg-red-500/10 text-red-400" : "bg-slate-800/60 text-slate-400"}`}>
          <AlertOctagon className="w-6 h-6" />
        </div>
      </div>

      {/* 4. Outbox & Background Failures */}
      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Outbox / AI Failures</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-100">{outboxFailed + aiJobFailed}</span>
            <span className="text-xs text-slate-400">{outboxFailed} Outbox, {aiJobFailed} AI</span>
          </div>
        </div>
        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
          <Inbox className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
