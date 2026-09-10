"use client";

/**
 * ============================================================================
 * Splinci Commerce OS — Production Stabilization Command Center
 * ============================================================================
 * Specification Reference: GO-002 / UI-001 / STABILIZATION-001
 * Route: /operations/stabilization
 * Theme: Dark Mode Premium (Consistent with Commerce OS Design Tokens)
 * ============================================================================
 */

import React, { useState } from "react";
import { useProductionStabilization } from "@/features/operations/hooks/useProductionStabilization";
import { Activity, ShieldCheck, Clock, CheckCircle2, AlertTriangle, RefreshCw, Server, Cpu, Database, Award, FileText } from "lucide-react";

export default function ProductionStabilizationPage() {
  const { data, loading, error, refetch, evaluateCheckpoint, recordEvidence } = useProductionStabilization();
  const [evaluating, setEvaluating] = useState(false);

  const handleEvaluate = async () => {
    setEvaluating(true);
    await evaluateCheckpoint();
    setEvaluating(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 text-white p-6 rounded-xl shadow-lg border border-slate-800 backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight">Controlled Production Launch & 24-Hour Stabilization</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Real-time operational telemetry monitoring, 24-hour observation checkpoints, and GATE 30 governance evidence framework.
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition shadow"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Live Telemetry
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center p-12 bg-slate-900/80 rounded-xl shadow border border-slate-800">
          <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
          <span className="ml-3 text-slate-300 font-medium">Evaluating live production operational metrics & GATE 30 evidence...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Executive Launch & GATE 30 Banner */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 text-white rounded-xl shadow border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-xs rounded-full uppercase tracking-wider shadow">
                  Status: {data.launchStatus}
                </span>
                <span className="text-slate-300 text-sm font-medium">
                  GATE 30:{" "}
                  <strong className={data.gate30Evidence.gate30Status === "PASS" ? "text-emerald-400" : "text-amber-400"}>
                    {data.gate30Evidence.gate30Status}
                  </strong>
                </span>
              </div>
              <h2 className="text-xl font-bold mt-2 text-white">
                {data.gate30Evidence.gate30Status === "NOT_VERIFIED"
                  ? "Platform is CONTROLLED_PRODUCTION_READY. Live production runtime observation in progress."
                  : "Production 24-hour stabilization window completed."}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {data.gate30Evidence.evidenceNotes}
              </p>
            </div>
            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg flex items-center gap-2 transition shrink-0 border border-indigo-500/30 shadow"
            >
              <Activity className={`h-4 w-4 ${evaluating ? "animate-spin" : ""}`} />
              Evaluate 24h Checkpoint
            </button>
          </div>

          {/* Live Production Health Telemetry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Availability</p>
                <p className="text-xl font-bold text-white mt-1">{data.currentHealth.availabilityPercent}%</p>
              </div>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Latency</p>
                <p className="text-xl font-bold text-white mt-1">{data.currentHealth.avgLatencyMs} ms</p>
              </div>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Error Rate</p>
                <p className="text-xl font-bold text-white mt-1">{data.currentHealth.errorRatePercent}%</p>
              </div>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">DB / DR Status</p>
                <p className="text-xl font-bold text-white mt-1">{data.currentHealth.drVerified ? "DR_VERIFIED" : "DEGRADED"}</p>
              </div>
            </div>
          </div>

          {/* Target Operational Threshold Metrics Table */}
          <div className="bg-slate-900/90 p-6 rounded-xl border border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="h-5 w-5 text-indigo-400" />
              Target Operational Threshold Compliance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.metrics.map((m) => (
                <div key={m.name} className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg flex justify-between items-center text-sm">
                  <div>
                    <span className="font-bold text-slate-200">{m.name}</span>
                    <p className="text-xs text-slate-400 mt-0.5">Target: {m.targetThreshold} {m.unit}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-indigo-300">{m.currentValue} {m.unit}</span>
                    <div>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded border ${m.isHealthy ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                        {m.isHealthy ? "HEALTHY" : "BREACHED"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GATE 30 Governance Evidence Details Card */}
          <div className="bg-slate-900/90 p-6 rounded-xl border border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              GATE 30 — Final Go-Live Governance Evidence Standard
            </h2>
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-3 text-sm text-slate-300">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800/60 pb-3 gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gate 30 Status</p>
                  <p className="text-lg font-bold text-amber-400 mt-0.5">{data.gate30Evidence.gate30Status}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Evaluator Decision</p>
                  <p className="text-sm font-bold text-indigo-300 mt-0.5">{data.gate30Evidence.evaluatorDecision}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-slate-400">Target Availability:</p>
                  <p className="font-mono text-slate-200 font-medium">99.9% (Observed: {data.gate30Evidence.availabilityPercent}%)</p>
                </div>
                <div>
                  <p className="text-slate-400">Target API Latency:</p>
                  <p className="font-mono text-slate-200 font-medium">&lt; 200ms (Observed: {data.gate30Evidence.avgLatencyMs}ms)</p>
                </div>
                <div>
                  <p className="text-slate-400">P1 Incident Target:</p>
                  <p className="font-mono text-slate-200 font-medium">0 Unresolved (Observed: {data.gate30Evidence.p1Count})</p>
                </div>
              </div>

              <p className="text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                <strong>Governance Rule:</strong> Technical readiness is certified. GATE 30 remains NOT_VERIFIED until actual post-deployment production runtime evidence satisfies the required 24-hour observation thresholds.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
