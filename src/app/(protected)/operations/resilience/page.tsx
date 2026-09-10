"use client";

/**
 * ============================================================================
 * Splinci Commerce OS — Production Resilience & DR Workspace
 * ============================================================================
 * Specification Reference: CI-006 / UI-001 / RESILIENCE-001
 * Route: /operations/resilience
 * Theme: Dark Mode Premium (Consistent with Commerce OS Design Tokens)
 * ============================================================================
 */

import React from "react";
import { useResilienceOperations } from "@/features/operations/hooks/useResilienceOperations";
import { ShieldCheck, AlertTriangle, Clock, Database, Server, RefreshCw, CheckCircle2, FileText } from "lucide-react";

export default function ProductionResiliencePage() {
  const { data, loading, error, refetch } = useResilienceOperations();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 text-white p-6 rounded-xl shadow-lg border border-slate-800 backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold tracking-tight">Production Resilience & DR Intelligence</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Enterprise recovery readiness scoring, RTO/RPO assessments, dependency resilience, and disaster recovery exercise posture.
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition shadow"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Resilience Analysis
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center p-12 bg-slate-900/80 rounded-xl shadow border border-slate-800">
          <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
          <span className="ml-3 text-slate-300 font-medium">Evaluating production resilience & recovery readiness...</span>
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
          {/* Executive Resilience Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recovery Readiness</p>
                <p className="text-xl font-bold text-white mt-1">{data.readiness.score} / 100 ({data.readiness.rating})</p>
              </div>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target RTO</p>
                <p className="text-xl font-bold text-white mt-1">{data.rto.targetMinutes} Mins ({data.rto.rtoStatus})</p>
              </div>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target RPO</p>
                <p className="text-xl font-bold text-white mt-1">{data.rpo.targetMinutes} Mins ({data.rpo.rpoStatus})</p>
              </div>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">DR Drill Score</p>
                <p className="text-xl font-bold text-white mt-1">{data.drReadiness.score} / 100</p>
              </div>
            </div>
          </div>

          {/* Dependency Resilience Catalog */}
          <div className="bg-slate-900/90 p-6 rounded-xl border border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="h-5 w-5 text-indigo-400" />
              Dependency Resilience & High-Availability Assessment
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-200">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-3">Component</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Details</th>
                    <th className="p-3 font-mono">Latency</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.dependencies.map((dep, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-white">{dep.name}</td>
                      <td className="p-3"><span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{dep.type}</span></td>
                      <td className="p-3 text-xs text-slate-300">{dep.details}</td>
                      <td className="p-3 font-mono text-indigo-300">{dep.latencyMs !== undefined ? `${dep.latencyMs}ms` : "N/A"}</td>
                      <td className="p-3 text-right">
                        <span className="px-2.5 py-1 text-xs font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {dep.status}
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
