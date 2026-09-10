"use client";

/**
 * ============================================================================
 * Splinci Commerce OS — Production Validation & DR Certification Workspace
 * ============================================================================
 * Specification Reference: CI-007 / UI-001 / VALIDATION-001
 * Route: /operations/validation
 * Theme: Dark Mode Premium (Consistent with Commerce OS Design Tokens)
 * ============================================================================
 */

import React from "react";
import { useProductionValidation } from "@/features/operations/hooks/useProductionValidation";
import { Award, CheckCircle2, AlertTriangle, Play, RefreshCw, Clock, Database, ShieldCheck, Activity } from "lucide-react";

export default function ProductionValidationPage() {
  const { data, loading, error, refetch, runValidation } = useProductionValidation();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 text-white p-6 rounded-xl shadow-lg border border-slate-800 backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-400" />
            <h1 className="text-2xl font-bold tracking-tight">Production Validation & DR Certification</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Evidence-driven operational validation, DR exercise execution, measured RTO/RPO verification, and readiness certification.
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition shadow"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Validation Framework
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center p-12 bg-slate-900/80 rounded-xl shadow border border-slate-800">
          <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
          <span className="ml-3 text-slate-300 font-medium">Evaluating operational readiness & recovery evidence...</span>
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
          {/* Operational Certification Banner */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 text-white rounded-xl shadow border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-amber-400 text-slate-950 font-bold text-xs rounded-full uppercase tracking-wider">
                  Certification Level: {data.certification.level}
                </span>
                <span className="text-slate-300 text-sm font-medium">Score: {data.certification.score} / 100</span>
              </div>
              <h2 className="text-lg font-bold mt-2 text-white">{data.certification.certificationMessage}</h2>
              <p className="text-xs text-slate-400 mt-1">
                Verified Controls: {data.certification.verifiedControlsCount} | Unverified Controls: {data.certification.unverifiedControlsCount} | Blockers: {data.certification.blockersCount}
              </p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1.5 rounded text-xs font-bold ${data.certification.isDRVerified ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}>
                DR VERIFIED: {data.certification.isDRVerified ? "PASSED" : "BACKUP_VERIFICATION_REQUIRED"}
              </span>
            </div>
          </div>

          {/* RTO / RPO Measured Verification Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Measured RTO Verification */}
            <div className="bg-slate-900/90 p-6 rounded-xl border border-slate-800 shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-400" />
                Measured RTO Verification
              </h2>
              <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2 text-sm text-slate-300">
                <p><strong>Target RTO:</strong> {data.rtoValidation.targetMinutes} Minutes</p>
                <p><strong>Measured Recovery Duration:</strong> {data.rtoValidation.measuredMinutes} Minutes</p>
                <p><strong>Variance:</strong> {data.rtoValidation.varianceMinutes} Minutes</p>
                <p className="text-xs text-slate-400 mt-2"><strong>Evidence:</strong> {data.rtoValidation.evidence}</p>
              </div>
            </div>

            {/* Measured RPO Verification */}
            <div className="bg-slate-900/90 p-6 rounded-xl border border-slate-800 shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-400" />
                Measured RPO Verification
              </h2>
              <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2 text-sm text-slate-300">
                <p><strong>Target RPO:</strong> {data.rpoValidation.targetMinutes} Minutes</p>
                <p><strong>Measured Data Loss:</strong> {data.rpoValidation.measuredMinutes} Minutes</p>
                <p><strong>Variance:</strong> {data.rpoValidation.varianceMinutes} Minutes</p>
                <p className="text-xs text-slate-400 mt-2"><strong>Evidence:</strong> {data.rpoValidation.evidence}</p>
              </div>
            </div>
          </div>

          {/* Validation Scenario Catalog */}
          <div className="bg-slate-900/90 p-6 rounded-xl border border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-400" />
              Operational Disaster Recovery & Resilience Scenario Catalog
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.scenarios.map((sc) => (
                <div key={sc.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-indigo-300">{sc.name}</span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">{sc.category}</span>
                  </div>
                  <p className="text-xs text-slate-400">Environment: {sc.environment} | Status: {sc.status}</p>
                  <div className="flex justify-between items-center pt-2 text-xs">
                    <span className="text-slate-400">Measured RTO: {sc.measuredRTOMinutes !== undefined ? `${sc.measuredRTOMinutes}m` : "N/A"}</span>
                    <button
                      onClick={() => runValidation(sc.id)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium flex items-center gap-1 transition border border-slate-700"
                    >
                      <Play className="h-3 w-3 text-emerald-400" />
                      Execute Scenario
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
