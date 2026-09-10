/**
 * ============================================================================
 * Splinci Commerce OS — IncidentTable Component
 * ============================================================================
 * Specification Reference: M12-004 / UI-001
 * Displays derived tenant operational incidents with source/severity filtering
 * ============================================================================
 */

import React from "react";
import { AlertCircle, AlertTriangle, Info, Bell, RefreshCw } from "lucide-react";
import { IncidentItemDto, IncidentSeverityEnum } from "@/types/operations.dto";

export function IncidentTable({
  incidents,
  onRefresh,
}: {
  incidents: IncidentItemDto[];
  onRefresh?: () => void;
}) {
  const getSeverityBadge = (severity: IncidentSeverityEnum) => {
    switch (severity) {
      case IncidentSeverityEnum.CRITICAL:
        return <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 rounded-full text-[10px] font-bold">CRITICAL</span>;
      case IncidentSeverityEnum.HIGH:
        return <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded-full text-[10px] font-bold">HIGH</span>;
      case IncidentSeverityEnum.MEDIUM:
        return <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-800 rounded-full text-[10px] font-bold">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-full text-[10px] font-bold">LOW</span>;
    }
  };

  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-slate-100 font-semibold text-base">Operational Incidents Log</h3>
          <p className="text-slate-400 text-xs">Derived failure events across outbox, AI jobs & workflows</p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700/50">
            <tr>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Source</th>
              <th className="py-2.5 px-3">Incident Description</th>
              <th className="py-2.5 px-3">Occurred At</th>
              <th className="py-2.5 px-3">Attention</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No active operational incidents recorded.
                </td>
              </tr>
            ) : (
              incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">{getSeverityBadge(inc.severity)}</td>
                  <td className="py-3 px-3 font-semibold text-slate-300">{inc.source}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-200">{inc.title}</div>
                    <div className="text-slate-400 text-[11px] truncate max-w-md">{inc.details}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{new Date(inc.occurredAt).toLocaleString()}</td>
                  <td className="py-3 px-3">
                    {inc.severity === IncidentSeverityEnum.CRITICAL || inc.severity === IncidentSeverityEnum.HIGH ? (
                      <span className="inline-flex items-center gap-1 text-red-400 font-semibold text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5" /> Immediate Action
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Monitored</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
