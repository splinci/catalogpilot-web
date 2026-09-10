"use client";

/**
 * ============================================================================
 * Splinci Commerce OS — Backup/PITR Restoration & DR Certification Workspace
 * ============================================================================
 * Specification Reference: CI-008 / UI-001 / BACKUP-001
 * Route: /operations/backup-recovery
 * Theme: Dark Mode Premium (Consistent with Commerce OS Design Tokens)
 * ============================================================================
 */

import React, { useState } from "react";
import { useBackupRecovery } from "@/features/operations/hooks/useBackupRecovery";
import { Database, ShieldCheck, Clock, RefreshCw, AlertTriangle, Play, CheckCircle2, FileText, Server } from "lucide-react";

export default function BackupRecoveryPage() {
  const { data, loading, error, refetch, executeStagingRestore } = useBackupRecovery();
  const [restoring, setRestoring] = useState(false);

  const handleRestoreDrill = async () => {
    setRestoring(true);
    await executeStagingRestore({
      environment: "staging",
      restoreTarget: "staging_isolated_drill_db",
    });
    setRestoring(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 text-white p-6 rounded-xl shadow-lg border border-slate-800 backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-purple-400" />
            <h1 className="text-2xl font-bold tracking-tight">PostgreSQL Backup & PITR Restoration Verification</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Evidence-driven database restoration verification, continuous WAL archiving audit, measured RPO/RTO verification, and DR certification.
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition shadow"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Backup Telemetry
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center p-12 bg-slate-900/80 rounded-xl shadow border border-slate-800">
          <RefreshCw className="h-8 w-8 text-purple-400 animate-spin" />
          <span className="ml-3 text-slate-300 font-medium">Discovering PostgreSQL backup snapshots & PITR buffers...</span>
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
          <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/80 text-white rounded-xl shadow border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 font-bold text-xs rounded-full uppercase tracking-wider ${data.isDRVerified ? "bg-emerald-400 text-slate-950" : "bg-amber-400 text-slate-950"}`}>
                  Certification Level: {data.certificationStatus}
                </span>
                <span className="text-slate-300 text-sm font-medium">DR Verified: {data.isDRVerified ? "YES" : "NO"}</span>
              </div>
              <h2 className="text-lg font-bold mt-2 text-white">
                {data.isDRVerified
                  ? "PostgreSQL backup restore evidence physically verified. DR_VERIFIED certification granted."
                  : "Platform is OPERATIONALLY_READY. Execute staging backup restore drill to achieve DR_VERIFIED certification."}
              </h2>
              {data.blockingReasons.length > 0 && (
                <div className="text-xs text-amber-300 mt-2 space-y-1">
                  {data.blockingReasons.map((reason, idx) => (
                    <p key={idx}>• {reason}</p>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleRestoreDrill}
              disabled={restoring}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-lg flex items-center gap-2 transition shrink-0 shadow-lg"
            >
              <Play className={`h-4 w-4 ${restoring ? "animate-spin" : ""}`} />
              {restoring ? "Executing Restore Drill..." : "Execute Staging Restore Drill"}
            </button>
          </div>

          {/* RPO / RTO Evidence Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/90 p-6 rounded-xl border border-slate-800 shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-400" />
                Recovery Point Objective (RPO) Evidence
              </h2>
              <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2 text-sm text-slate-300">
                <p><strong>Target RPO:</strong> {data.rpoEvidence.targetMinutes} Minutes</p>
                <p><strong>Measured Data Loss Interval:</strong> {data.rpoEvidence.measuredMinutes ?? "N/A"} Minutes</p>
                <p><strong>Status:</strong> <span className={`font-bold ${data.rpoEvidence.isPassed ? "text-emerald-400" : "text-amber-400"}`}>{data.rpoEvidence.status}</span></p>
                <p className="text-xs text-slate-400 mt-2"><strong>Evidence:</strong> {data.rpoEvidence.evidence}</p>
              </div>
            </div>

            <div className="bg-slate-900/90 p-6 rounded-xl border border-slate-800 shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-400" />
                Recovery Time Objective (RTO) Evidence
              </h2>
              <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2 text-sm text-slate-300">
                <p><strong>Target RTO:</strong> {data.rtoEvidence.targetMinutes} Minutes</p>
                <p><strong>Measured Restore Duration:</strong> {data.rtoEvidence.measuredMinutes ?? "N/A"} Minutes</p>
                <p><strong>Status:</strong> <span className={`font-bold ${data.rtoEvidence.isPassed ? "text-emerald-400" : "text-amber-400"}`}>{data.rtoEvidence.status}</span></p>
                <p className="text-xs text-slate-400 mt-2"><strong>Evidence:</strong> {data.rtoEvidence.evidence}</p>
              </div>
            </div>
          </div>

          {/* Discovered Backups Catalog */}
          <div className="bg-slate-900/90 p-6 rounded-xl border border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-400" />
              Discovered PostgreSQL Backups & Continuous WAL Buffers
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-200">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-3">Backup Identifier</th>
                    <th className="p-3">Provider</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Created At</th>
                    <th className="p-3">Retention</th>
                    <th className="p-3">PITR Buffer</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.availableBackups.map((bak) => (
                    <tr key={bak.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono text-purple-300 font-medium">{bak.id}</td>
                      <td className="p-3 text-xs text-slate-400">{bak.provider}</td>
                      <td className="p-3"><span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">{bak.backupType}</span></td>
                      <td className="p-3 text-xs">{new Date(bak.createdAt).toLocaleString()}</td>
                      <td className="p-3 font-mono">{bak.retentionDays} Days</td>
                      <td className="p-3">{bak.isPITRAvailable ? "7 Days Active" : "Disabled"}</td>
                      <td className="p-3 text-right">
                        <span className="px-2.5 py-1 text-xs font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {bak.status}
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
