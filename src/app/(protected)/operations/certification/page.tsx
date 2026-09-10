"use client";

/**
 * ============================================================================
 * Splinci Commerce OS — Production Certification & Go-Live Readiness Workspace
 * ============================================================================
 * Specification Reference: CI-009 / UI-001 / CERTIFICATION-001
 * Route: /operations/certification
 * Theme: Dark Mode Premium (Consistent with Commerce OS Design Tokens)
 * ============================================================================
 */

import React, { useState } from "react";
import { useProductionCertification } from "@/features/operations/hooks/useProductionCertification";
import { Award, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Lock, Database, Server, FileText, Activity } from "lucide-react";

export default function ProductionCertificationPage() {
  const { data, loading, error, refetch, executeSignOff } = useProductionCertification();
  const [signingOff, setSigningOff] = useState(false);

  const handleSignOff = async () => {
    setSigningOff(true);
    await executeSignOff({
      signOffRole: "Lead Enterprise Architect",
      comments: "Enterprise production release v1.0.0-GA approved for General Availability.",
      confirmGoLiveReady: true,
    });
    setSigningOff(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 text-white p-6 rounded-xl shadow-lg border border-slate-800 backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold tracking-tight">Enterprise Production Certification</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Final evidence-driven certification framework for controlled General Availability release of Splinci Commerce OS v1.0.0-GA.
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition shadow"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Re-evaluate Certification
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center p-12 bg-slate-900/80 rounded-xl shadow border border-slate-800">
          <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
          <span className="ml-3 text-slate-300 font-medium">Evaluating 26 mandatory certification gates & go-live readiness...</span>
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
          {/* Certification Banner */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/80 text-white rounded-xl shadow border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-emerald-400 text-slate-950 font-bold text-xs rounded-full uppercase tracking-wider shadow">
                  Status: {data.certificationLevel}
                </span>
                <span className="text-slate-300 text-sm font-medium">Readiness Score: {data.readinessScore.totalScore} / 100</span>
              </div>
              <h2 className="text-xl font-bold mt-2 text-white">
                {data.certificationLevel === "PRODUCTION_CERTIFIED"
                  ? "Splinci Commerce OS v1.0.0-GA is PRODUCTION CERTIFIED for General Availability."
                  : data.certificationLevel === "GO_LIVE_READY"
                  ? "Platform is GO_LIVE_READY. Execute administrative sign-off to issue final Production Certification."
                  : "Platform is CONDITIONALLY_READY. Address failing gates prior to production launch."}
              </h2>
              {data.signOffCompleted && (
                <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Administrative Sign-Off Completed by {data.signOffBy} on {new Date(data.signOffAt!).toLocaleString()}
                </p>
              )}
            </div>
            {!data.signOffCompleted && (
              <button
                onClick={handleSignOff}
                disabled={signingOff || data.readinessScore.failedCriticalGatesCount > 0}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-lg flex items-center gap-2 transition shrink-0 shadow-lg"
              >
                <Award className={`h-4 w-4 ${signingOff ? "animate-spin" : ""}`} />
                {signingOff ? "Signing Off..." : "Execute Administrative Sign-Off"}
              </button>
            )}
          </div>

          {/* Go-Live Readiness Category Scores Grid */}
          <div className="bg-slate-900/90 p-6 rounded-xl border border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              Weighted Go-Live Readiness Score Breakdown (100-Point Model)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.readinessScore.categoryScores).map(([cat, score]) => (
                <div key={cat} className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg">
                  <p className="text-xs font-semibold text-slate-400 truncate">{cat}</p>
                  <p className="text-lg font-bold text-white mt-1">{score} Pts</p>
                </div>
              ))}
            </div>
          </div>

          {/* 26 Mandatory Certification Gates Table */}
          <div className="bg-slate-900/90 p-6 rounded-xl border border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
              26 Mandatory Production Certification Gates
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
                        <span className={`px-2.5 py-1 text-xs font-bold rounded border ${gate.status === "PASS" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
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
