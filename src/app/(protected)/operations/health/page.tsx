"use client";

/**
 * ============================================================================
 * Splinci Commerce OS — System Health & Telemetry Page
 * ============================================================================
 * Specification Reference: M12-004 / UI-001
 * Platform Health Workspace
 * ============================================================================
 */

import React from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Activity, RefreshCw } from "lucide-react";
import { useOperationsHealth } from "@/features/operations/hooks/useOperationsHealth";
import { SystemHealthCard } from "@/features/operations/components/SystemHealthCard";
import { OperationsReadinessCard } from "@/features/operations/components/OperationsReadinessCard";
import { LoadingSkeleton, ErrorState } from "@/features/operations/components/StateComponents";

export default function OperationsHealthPage() {
  const { telemetry, history, readiness, loading, error, refresh, performHealthCheck } = useOperationsHealth();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <PageHero title="System Health & Diagnostic Telemetry" description="Real-time platform database latency, memory heap & health check log history" />
        <LoadingSkeleton title="Loading System Telemetry..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <PageHero title="System Health & Diagnostic Telemetry" description="Real-time platform database latency, memory heap & health check log history" />
        <ErrorState message={error} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHero
        title="System Health & Diagnostic Telemetry"
        description="Real-time platform database latency, memory heap & health check log history"
        actions={
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
          </button>
        }
      />

      <SystemHealthCard telemetry={telemetry} onRunHealthCheck={performHealthCheck} />
      <OperationsReadinessCard readiness={readiness} />

      {/* Health History Table */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-4">
        <h3 className="text-slate-100 font-semibold text-base">Health Check History Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700/50">
              <tr>
                <th className="py-2.5 px-3">Check ID</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Checked At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-500">
                    No historical health check records.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono text-slate-400">{h.id}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-[10px] font-bold">
                        {h.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{new Date(h.checkedAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
