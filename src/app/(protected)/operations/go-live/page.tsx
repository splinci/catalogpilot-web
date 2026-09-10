"use client";

/**
 * ============================================================================
 * Splinci Commerce OS — Production Go-Live Operations Command Center
 * ============================================================================
 * Specification Reference: GO-001 / UI-001 / GOLIVE-001
 * Route: /operations/go-live
 * Theme: Dark Mode Premium (Consistent with Commerce OS Design Tokens)
 * ============================================================================
 */

import React, { useState } from "react";
import { useGoLiveOperations } from "@/features/operations/hooks/useGoLiveOperations";
import { Rocket, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Play, Clock, Database, Activity, Server, FileText } from "lucide-react";

export default function GoLiveOperationsPage() {
  const { data, loading, error, refetch, executeSmokeTest } = useGoLiveOperations();
  const [testing, setTesting] = useState(false);

  const handleSmokeTest = async () => {
    setTesting(true);
    await executeSmokeTest();
    setTesting(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 text-white p-6 rounded-xl shadow-lg border border-slate-800 backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold tracking-tight">Production Go-Live & Stabilization Command Center</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Controlled production launch framework, preflight readiness checks, non-destructive smoke tests, and 30-gate governance.
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition shadow"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Go-Live Status
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center p-12 bg-slate-900/80 rounded-xl shadow border border-slate-800">
          <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
          <span className="ml-3 text-slate-300 font-medium">Evaluating 30 mandatory go-live gates & production readiness...</span>
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
          {/* Executive Go-Live Status Banner */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/80 text-white rounded-xl shadow border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-emerald-400 text-slate-950 font-bold text-xs rounded-full uppercase tracking-wider shadow">
                  Status: {data.goLiveStatus}
                </span>
                <span className="text-slate-300 text-sm font-medium">Certification Level: {data.certificationLevel}</span>
              </div>
              <h2 className="text-xl font-bold mt-2 text-white">
                {data.goLiveStatus === "STABLE_PRODUCTION"
                  ? "Splinci Commerce OS v1.0.0-GA is in STABLE_PRODUCTION."
                  : data.goLiveStatus === "CONTROLLED_LAUNCH" || data.goLiveStatus === "PRE_FLIGHT"
                  ? "Platform is CONTROLLED_PRODUCTION_READY. All preflight checks passed."
                  : "Go-Live preflight is BLOCKED. Address failing gates."}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Passed Gates: {data.passedGatesCount} / {data.gatesCount} | Config Status: {data.configValidation.overallStatus}
              </p>
            </div>
            <button
              onClick={handleSmokeTest}
              disabled={testing || data.preflight.status === "BLOCKED"}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-lg flex items-center gap-2 transition shrink-0 shadow-lg"
            >
              <Play className={`h-4 w-4 ${testing ? "animate-spin" : ""}`} />
              {testing ? "Running Smoke Test..." : "Execute Non-Destructive Smoke Test"}
            </button>
          </div>

          {/* Preflight & Configuration Validation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Environment Config Validation */}
            <div className="bg-slate-900/90 p-6 rounded-xl border border-slate-800 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Server className="h-5 w-5 text-indigo-400" />
                Sanitized Environment Variable Validation
              </h2>
              <div className="space-y-2">
                {data.configValidation.checks.map((chk) => (
                  <div key={chk.key} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex justify-between items-center text-sm">
                    <div>
                      <p className="font-mono font-bold text-slate-200">{chk.key}</p>
                      <p className="text-xs text-slate-400">{chk.notes}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded border ${chk.status === "VALID" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                      {chk.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stabilization Reviews Grid */}
            <div className="bg-slate-900/90 p-6 rounded-xl border border-slate-800 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-400" />
                24-Hour & 7-Day Stabilization Posture
              </h2>
              <div className="space-y-3">
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-indigo-300">24-Hour Observation Window</span>
                    <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{data.stabilization24h.status}</span>
                  </div>
                  <p className="text-xs text-slate-400">Availability: {data.stabilization24h.availabilityPercent}% | Avg Latency: {data.stabilization24h.avgLatencyMs}ms | Incidents: {data.stabilization24h.totalIncidentsCount}</p>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-indigo-300">7-Day Stabilization Review</span>
                    <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{data.stabilization7d.status}</span>
                  </div>
                  <p className="text-xs text-slate-400">Availability: {data.stabilization7d.availabilityPercent}% | Avg Latency: {data.stabilization7d.avgLatencyMs}ms | Incidents: {data.stabilization7d.totalIncidentsCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 30 Mandatory Governance Acceptance Gates Table */}
          <div className="bg-slate-900/90 p-6 rounded-xl border border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
              30 Mandatory Governance Acceptance Gates Matrix
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-200">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-3">Gate ID</th>
                    <th className="p-3">Gate Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Critical</th>
                    <th className="p-3">Evidence</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.gates.map((gate) => (
                    <tr key={gate.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono font-bold text-indigo-300 text-xs">{gate.id}</td>
                      <td className="p-3 font-medium text-white">{gate.name}</td>
                      <td className="p-3"><span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">{gate.category}</span></td>
                      <td className="p-3">{gate.isCritical ? <span className="text-red-400 font-bold text-xs">YES</span> : <span className="text-slate-500 text-xs">NO</span>}</td>
                      <td className="p-3 text-xs text-slate-400">{gate.evidence}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded border ${gate.status === "PASS" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : gate.status === "WARNING" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                          {gate.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
