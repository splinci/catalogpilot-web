/**
 * ============================================================================
 * Splinci Commerce OS — OperationsReadinessCard Component
 * ============================================================================
 * Specification Reference: M12-004 / UI-001
 * Displays composite operational readiness evaluation details
 * ============================================================================
 */

import React from "react";
import { CheckCircle, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";
import { ReadinessResult } from "../hooks/useOperationsHealth";

export function OperationsReadinessCard({ readiness }: { readiness: ReadinessResult | null }) {
  if (!readiness) return null;

  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-slate-100 font-semibold text-base">Production Readiness Score</h3>
            <p className="text-slate-400 text-xs">Composite health, queue & incident evaluation</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-slate-100">{readiness.score}/100</span>
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full ${
              readiness.status === "READY"
                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                : readiness.status === "DEGRADED"
                ? "bg-amber-950 text-amber-400 border border-amber-800"
                : "bg-red-950 text-red-400 border border-red-800"
            }`}
          >
            {readiness.status}
          </span>
        </div>
      </div>

      {/* Critical Blockers */}
      {readiness.blockers && readiness.blockers.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Critical Blockers ({readiness.blockers.length})</span>
          <div className="space-y-1 text-xs">
            {readiness.blockers.map((b, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-red-950/40 text-red-300 rounded-lg border border-red-900/50">
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {readiness.warnings && readiness.warnings.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Operational Warnings ({readiness.warnings.length})</span>
          <div className="space-y-1 text-xs">
            {readiness.warnings.map((w, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-amber-950/40 text-amber-300 rounded-lg border border-amber-900/50">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Passed Checks */}
      {readiness.passedChecks && readiness.passedChecks.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Passed Operational Checks</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {readiness.passedChecks.map((c, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/40 text-slate-300 rounded-lg border border-slate-700/50">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
