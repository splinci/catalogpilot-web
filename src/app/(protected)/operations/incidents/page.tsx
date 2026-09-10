"use client";

/**
 * ============================================================================
 * Splinci Commerce OS — Operational Incidents Workspace Page
 * ============================================================================
 * Specification Reference: M12-004 / UI-001
 * Operational Incident Monitoring & Action Gate Workspace
 * ============================================================================
 */

import React, { useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { AlertOctagon, Filter, RefreshCw } from "lucide-react";
import { useOperationsIncidents } from "@/features/operations/hooks/useOperationsIncidents";
import { IncidentTable } from "@/features/operations/components/IncidentTable";
import { CriticalIncidentBanner } from "@/features/operations/components/CriticalIncidentBanner";
import { LoadingSkeleton, ErrorState } from "@/features/operations/components/StateComponents";

export default function OperationsIncidentsPage() {
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("");

  const { incidents, summary, critical, loading, error, refresh } = useOperationsIncidents({
    source: selectedSource || undefined,
    severity: selectedSeverity || undefined,
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <PageHero title="Operational Incidents Workspace" description="Derived operational failures, action gate alerts & severity tracking" />
        <LoadingSkeleton title="Loading Operational Incidents..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <PageHero title="Operational Incidents Workspace" description="Derived operational failures, action gate alerts & severity tracking" />
        <ErrorState message={error} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHero
        title="Operational Incidents Workspace"
        description="Derived operational failures, action gate alerts & severity tracking across outbox, AI jobs & workflows"
        actions={
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Incidents
          </button>
        }
      />

      <CriticalIncidentBanner incidents={critical} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-xs font-semibold uppercase">Total Incidents</span>
          <div className="text-2xl font-bold text-slate-100 mt-1">{summary?.totalIncidents ?? 0}</div>
        </div>
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-xs font-semibold uppercase">Critical Severity</span>
          <div className="text-2xl font-bold text-red-400 mt-1">{summary?.bySeverity?.critical ?? 0}</div>
        </div>
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-xs font-semibold uppercase">High Severity</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{summary?.bySeverity?.high ?? 0}</div>
        </div>
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-xs font-semibold uppercase">Action Required</span>
          <div className="text-2xl font-bold text-blue-400 mt-1">{summary?.actionRequiredCount ?? 0}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-semibold">
          <Filter className="w-4 h-4" /> Filters:
        </div>

        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none"
        >
          <option value="">All Incident Sources</option>
          <option value="OUTBOX">Outbox Dispatcher</option>
          <option value="AI_JOB">AI Catalog Job</option>
          <option value="WORKFLOW">Workflow Engine</option>
          <option value="SECURITY_AUDIT">Security Audit</option>
        </select>

        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none"
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      <IncidentTable incidents={incidents} onRefresh={refresh} />
    </div>
  );
}
