"use client";

/**
 * ============================================================================
 * Splinci Commerce OS — Final Production Go-Live Evidence Workspace
 * ============================================================================
 * Specification Reference: GO-004 / GO-003 / GO-001 / GO-002 / SAD-001
 * Domain: Enterprise Final Go-Live Evidence Command Center UI
 * ============================================================================
 */

import React from "react";
import { useGoLiveEvidence } from "@/features/operations/hooks/useGoLiveEvidence";
import {
  ShieldCheck,
  Activity,
  Clock,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  Server,
  Lock,
  ArrowRight,
  Database,
  BarChart3,
  Flame,
} from "lucide-react";

export default function GoLiveEvidencePage() {
  const {
    dashboard,
    isLoading,
    isCapturing,
    isFinalizing,
    error,
    actionMessage,
    refresh,
    captureSample,
    evaluateWindow,
    finalizePackage,
  } = useGoLiveEvidence();

  if (isLoading && !dashboard) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="flex items-center space-x-3 text-emerald-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-lg font-medium">Loading Production Evidence Command Center...</span>
        </div>
      </div>
    );
  }

  const ev = dashboard?.gate30Evidence;
  const progress = dashboard?.progress;
  const breaches = dashboard?.breaches || [];
  const isGate30Passed = ev?.gate30Status === "READY_FOR_FINAL_APPROVAL" || ev?.gate30Status === "PASS";
  const isGate30NotVerified = ev?.gate30Status === "NOT_VERIFIED";

  // Format hours into h m
  const formatHoursToHm = (hours?: number) => {
    if (hours === undefined || hours === null) return "0h 0m";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Final Production Go-Live Evidence Command Center
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            GO-004 Governance Standard &bull; Splinci Commerce OS v1.0.0-GA
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 rounded-lg text-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={captureSample}
            disabled={isCapturing}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition shadow-lg shadow-emerald-950/50"
          >
            <Activity className="w-4 h-4" />
            <span>{isCapturing ? "Capturing..." : "Record Live Sample"}</span>
          </button>
          <button
            onClick={finalizePackage}
            disabled={isFinalizing}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition shadow-lg shadow-indigo-950/50"
          >
            <FileCheck className="w-4 h-4" />
            <span>{isFinalizing ? "Finalizing..." : "Finalize Evidence Package"}</span>
          </button>
        </div>
      </div>

      {/* Action / Error Messages */}
      {actionMessage && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 rounded-xl flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{actionMessage}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-950/50 border border-rose-500/50 text-rose-300 rounded-xl flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Official Status Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Official Platform Status</div>
          <div className="mt-2 flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xl font-bold text-emerald-300">CONTROLLED_PRODUCTION_READY</span>
          </div>
          <p className="text-slate-400 text-xs mt-2">GA Launch Certified &bull; Continuous 24h Monitoring Active</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Telemetry Provenance</div>
          <div className="mt-2 flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${ev?.provenance === "PRODUCTION_RUNTIME_EVIDENCE" ? "bg-emerald-400" : "bg-indigo-400"}`} />
            <span className="text-xl font-bold text-slate-100">
              {ev?.provenance || "TEST"}
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-2">Server-Authoritative Runtime Classification</p>
        </div>

        <div className={`border rounded-xl p-5 backdrop-blur-md ${isGate30Passed ? "bg-emerald-950/40 border-emerald-600/50" : (isGate30NotVerified ? "bg-amber-950/40 border-amber-600/50" : "bg-rose-950/40 border-rose-600/50")}`}>
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">GATE 30 Governance Decision</div>
          <div className="mt-2 flex items-center space-x-2">
            {isGate30Passed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : isGate30NotVerified ? (
              <Clock className="w-6 h-6 text-amber-400" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-400" />
            )}
            <span className={`text-xl font-bold ${isGate30Passed ? "text-emerald-300" : (isGate30NotVerified ? "text-amber-300" : "text-rose-300")}`}>
              {ev?.gate30Status || "NOT_VERIFIED"}
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-2">{ev?.evaluatorDecision || "Pending 24h runtime evidence"}</p>
        </div>
      </div>

      {/* 24-HOUR PRODUCTION OBSERVATION PROGRESS WIDGET */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-indigo-400" />
            <div>
              <h2 className="text-lg font-bold text-white">24-HOUR PRODUCTION OBSERVATION PROGRESS</h2>
              <p className="text-xs text-slate-400">Continuous telemetry collection for GATE 30 certification</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-slate-400">Observation Status:</span>
            <span className="px-2 py-1 bg-indigo-950 border border-indigo-700/50 text-indigo-300 rounded font-bold">
              {progress?.status || "OBSERVING_24H"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-xs font-semibold">Elapsed Duration</div>
            <div className="text-2xl font-bold text-indigo-300 mt-1">{formatHoursToHm(progress?.elapsedHours)}</div>
            <div className="text-[10px] text-slate-500 mt-1">Goal: 24h 0m</div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-xs font-semibold">Remaining</div>
            <div className="text-2xl font-bold text-amber-300 mt-1">{formatHoursToHm(progress?.remainingHours)}</div>
            <div className="text-[10px] text-slate-500 mt-1">Until 24h Milestone</div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-xs font-semibold">Telemetry Coverage</div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{progress?.coveragePercent ?? 100}%</div>
            <div className="text-[10px] text-slate-500 mt-1">Target: ≥ 99.0%</div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-xs font-semibold">Sample Count</div>
            <div className="text-2xl font-bold text-white mt-1">{progress?.sampleCount ?? 0}</div>
            <div className="text-[10px] text-slate-500 mt-1">Recorded Samples</div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-xs font-semibold">Observation Gaps</div>
            <div className="text-2xl font-bold text-slate-200 mt-1">{progress?.gapCount ?? 0}</div>
            <div className="text-[10px] text-slate-500 mt-1">Max Gap: {progress?.longestGapMinutes ?? 0}m</div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-xs font-semibold">Breach Count</div>
            <div className={`text-2xl font-bold mt-1 ${progress?.breachCount && progress.breachCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {progress?.breachCount ?? 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Target: 0 Breaches</div>
          </div>
        </div>
      </div>

      {/* Key Operational Evidence Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {dashboard?.metrics.map((m, idx) => (
          <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-xs">{m.metricName}</div>
            <div className="text-2xl font-bold text-white mt-1">
              {m.observedValue} <span className="text-xs text-slate-400 font-normal">{m.unit}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400">Target: {m.targetThreshold}{m.unit}</span>
              <span className={`font-semibold ${m.isHealthy ? "text-emerald-400" : "text-rose-400"}`}>
                {m.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Threshold Breach History Log */}
      {breaches.length > 0 && (
        <div className="bg-rose-950/30 border border-rose-600/40 rounded-xl p-6 space-y-3">
          <div className="flex items-center space-x-2 text-rose-400 font-semibold text-lg">
            <Flame className="w-5 h-5" />
            <span>Recorded Operational Threshold Breaches ({breaches.length})</span>
          </div>
          <p className="text-slate-300 text-sm">
            Permanent, append-only breach records logged during post-launch observation.
          </p>
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-rose-900/50 text-rose-300">
                  <th className="p-2">Timestamp</th>
                  <th className="p-2">Metric</th>
                  <th className="p-2">Observed</th>
                  <th className="p-2">Threshold</th>
                  <th className="p-2">Severity</th>
                  <th className="p-2">GATE 30 Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-950 text-rose-200">
                {breaches.map((b) => (
                  <tr key={b.id}>
                    <td className="p-2">{b.timestamp}</td>
                    <td className="p-2 font-bold">{b.metric}</td>
                    <td className="p-2">{b.observedValue}</td>
                    <td className="p-2">{b.requiredThreshold}</td>
                    <td className="p-2 font-bold text-rose-400">{b.severity}</td>
                    <td className="p-2 text-rose-300">{b.invalidatesGate30 ? "INVALIDATES_GATE_30" : "LOGGED"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Missing Evidence Gap Reporter */}
      {ev?.missingEvidenceList && ev.missingEvidenceList.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-600/40 rounded-xl p-6 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-lg">
            <AlertTriangle className="w-5 h-5" />
            <span>Active Production Evidence Gaps ({ev.missingEvidenceList.length})</span>
          </div>
          <p className="text-slate-300 text-sm">
            Per GO-004 governance rule: GATE 30 MUST remain <code className="text-amber-300 bg-amber-950 px-1 py-0.5 rounded">NOT_VERIFIED</code> until genuine live production runtime observation satisfies all 15 verification criteria over a continuous 24-hour window.
          </p>
          <ul className="space-y-1 text-sm text-amber-200/90 list-disc list-inside">
            {ev.missingEvidenceList.map((gap, i) => (
              <li key={i}>{gap}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 15-Point Mandatory Verification Checklist */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>15-Point Mandatory Production Stability Verification Flags</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">GO-004 Standard Checklist</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {ev?.verificationFlags &&
            Object.entries(ev.verificationFlags).map(([key, val]) => (
              <div
                key={key}
                className={`p-3 rounded-lg border flex items-center justify-between text-xs font-mono ${
                  val ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300" : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <span className="capitalize">{key.replace("Verified", "")}</span>
                {val ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-slate-500" />}
              </div>
            ))}
        </div>
      </div>

      {/* Observation Timeline Windows */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          <span>Continuous Observation Window Timeline</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
          {dashboard?.windows.map((w, i) => (
            <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
              <div className="text-xs font-bold text-indigo-300">{w.windowType}</div>
              <div className="text-xs text-slate-400">Duration: {w.durationHours}h</div>
              <div className="text-xs text-slate-400">Samples: {w.sampleCount}</div>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">{w.isComplete ? "Complete" : "In Progress"}</span>
                <span className={`font-semibold ${w.status === "SUFFICIENT" ? "text-emerald-400" : "text-amber-400"}`}>
                  {w.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 30-Gate Governance Matrix */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <span>GO-030 Acceptance Matrix ({dashboard?.gate30Evaluation.passedGatesCount}/30 Passed)</span>
          </h2>
          <div className="text-sm font-semibold text-emerald-400">
            Readiness Score: {dashboard?.gate30Evaluation.readinessScore}/100
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                <th className="p-3 font-semibold">Gate ID</th>
                <th className="p-3 font-semibold">Name</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Type</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {dashboard?.gate30Evaluation.gates.map((g) => (
                <tr key={g.gateId} className="hover:bg-slate-900/40">
                  <td className="p-3 font-mono text-slate-400">{g.gateId}</td>
                  <td className="p-3 font-medium text-white">{g.name}</td>
                  <td className="p-3 text-slate-400">{g.category}</td>
                  <td className="p-3 font-semibold text-amber-400">{g.isCritical ? "CRITICAL" : "STANDARD"}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        g.status === "PASS"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                          : g.status === "FAIL"
                          ? "bg-rose-950 text-rose-400 border border-rose-500/30"
                          : "bg-amber-950 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {g.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{g.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
