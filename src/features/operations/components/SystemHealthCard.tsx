/**
 * ============================================================================
 * Splinci Commerce OS — SystemHealthCard Component
 * ============================================================================
 * Specification Reference: M12-004 / UI-001
 * Displays platform database health & raw connection telemetry
 * ============================================================================
 */

import React from "react";
import { Activity, Database, Clock, HardDrive, RefreshCw } from "lucide-react";
import { SystemHealthTelemetryDto } from "@/types/operations.dto";

export function SystemHealthCard({
  telemetry,
  onRunHealthCheck,
}: {
  telemetry: SystemHealthTelemetryDto | null;
  onRunHealthCheck?: () => void;
}) {
  if (!telemetry) return null;

  const dbStatus = telemetry.database.status;
  const isDbConnected = dbStatus === "CONNECTED";
  const latencyMs = telemetry.database.latencyMs;

  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-slate-100 font-semibold text-base">Platform Health & Telemetry</h3>
            <p className="text-slate-400 text-xs">Node process & PostgreSQL diagnostic state</p>
          </div>
        </div>

        {onRunHealthCheck && (
          <button
            onClick={onRunHealthCheck}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Run Health Check
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        {/* Database Latency */}
        <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50 space-y-1">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-400" /> Database Latency
          </span>
          <div className="text-slate-100 font-bold text-base">{latencyMs} ms</div>
          <span className={`text-[10px] font-semibold ${latencyMs < 100 ? "text-emerald-400" : latencyMs < 300 ? "text-amber-400" : "text-red-400"}`}>
            {isDbConnected ? (latencyMs < 100 ? "Optimal" : "Elevated") : "Disconnected"}
          </span>
        </div>

        {/* Process Uptime */}
        <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50 space-y-1">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" /> Process Uptime
          </span>
          <div className="text-slate-100 font-bold text-base">{Math.floor(telemetry.uptimeSeconds / 60)} min</div>
          <span className="text-[10px] text-slate-400">{telemetry.uptimeSeconds}s total</span>
        </div>

        {/* Heap Memory */}
        <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50 space-y-1">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-purple-400" /> Memory Heap
          </span>
          <div className="text-slate-100 font-bold text-base">{telemetry.system.memoryHeapUsedMB} MB</div>
          <span className="text-[10px] text-slate-400">RSS: {telemetry.system.memoryRssMB} MB</span>
        </div>

        {/* Runtime Version */}
        <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50 space-y-1">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" /> Node Runtime
          </span>
          <div className="text-slate-100 font-bold text-base">{telemetry.system.nodeVersion}</div>
          <span className="text-[10px] text-slate-400">Splinci OS {telemetry.version}</span>
        </div>
      </div>
    </div>
  );
}
