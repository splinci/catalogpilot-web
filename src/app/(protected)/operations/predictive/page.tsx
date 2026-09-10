"use client";

/**
 * ============================================================================
 * Splinci Commerce OS — Predictive Operations & Capacity Planning Workspace
 * ============================================================================
 * Specification Reference: CI-005 / UI-001 / PREDICTIVE-001
 * Route: /operations/predictive
 * Theme: Dark Mode Premium (Consistent with Commerce OS Design Tokens)
 * ============================================================================
 */

import React from "react";
import { usePredictiveOperations } from "@/features/operations/hooks/usePredictiveOperations";
import { AlertTriangle, TrendingUp, Cpu, Server, Activity, ShieldAlert, CheckCircle2, RefreshCw } from "lucide-react";

export default function PredictiveOperationsPage() {
  const { data, loading, error, refetch } = usePredictiveOperations();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 text-white p-6 rounded-xl shadow-lg border border-slate-800 backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight">Predictive Operations & Capacity Intelligence</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Enterprise time-series forecasting, outbox queue capacity analysis, and predictive SLO risk warnings.
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition shadow"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Forecasts
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center p-12 bg-slate-900/80 rounded-xl shadow border border-slate-800">
          <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
          <span className="ml-3 text-slate-300 font-medium">Evaluating predictive operations metrics...</span>
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
          {/* Executive Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Platform Risk</p>
                <p className="text-xl font-bold text-white mt-1">{data.executiveSummary.overallPlatformRisk}</p>
              </div>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                <Cpu className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Worker Saturation</p>
                <p className="text-xl font-bold text-white mt-1">{data.executiveSummary.outboxWorkerSaturation}</p>
              </div>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
                <Server className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">DB Latency Risk</p>
                <p className="text-xl font-bold text-white mt-1">{data.executiveSummary.databaseLatencyRisk}</p>
              </div>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Recommendations</p>
                <p className="text-xl font-bold text-white mt-1">{data.executiveSummary.activeRecommendationsCount}</p>
              </div>
            </div>
          </div>

          {/* Time-Series Forecasts Catalog */}
          <div className="bg-slate-900/90 p-6 rounded-xl border border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              Predictive Capacity & Latency Forecasts
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-200">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-3">Metric Name</th>
                    <th className="p-3">Window</th>
                    <th className="p-3">Historical Avg</th>
                    <th className="p-3">Forecasted Value</th>
                    <th className="p-3">Projected Change</th>
                    <th className="p-3 text-right">Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.forecasts.map((fc, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-white">{fc.metricName}</td>
                      <td className="p-3"><span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">{fc.window}</span></td>
                      <td className="p-3 font-mono text-slate-300">{fc.historicalAverage}</td>
                      <td className="p-3 font-mono text-indigo-300 font-medium">{fc.forecastedValue}</td>
                      <td className="p-3 font-mono text-slate-300">{fc.projectedChangePercent > 0 ? `+${fc.projectedChangePercent}%` : `${fc.projectedChangePercent}%`}</td>
                      <td className="p-3 text-right text-xs text-slate-400">{fc.explanation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Predictive Capacity Recommendations */}
          <div className="bg-slate-900/90 p-6 rounded-xl border border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              Automated Capacity & SLO Optimization Recommendations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.recommendations.map((rec) => (
                <div key={rec.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-indigo-300">{rec.metricName}</span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{rec.severity}</span>
                  </div>
                  <p className="text-xs text-slate-300">{rec.recommendedAction}</p>
                  <p className="text-xs text-slate-400 font-mono">Confidence: {rec.confidence} | Forecast: {rec.forecastedValue} (Threshold: {rec.threshold})</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
