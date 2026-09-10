"use client";

import React from "react";
import { CheckCircle, Copy, Clock, Globe } from "lucide-react";
import { WorkflowStatusBadge } from "./WorkflowStatusBadge";

interface WorkflowVersionTableProps {
  versions: any[];
  currentVersion?: number;
  onPublish?: (versionNumber: number) => void;
  onClone?: (versionNumber: number) => void;
}

export function WorkflowVersionTable({
  versions,
  currentVersion,
  onPublish,
  onClone,
}: WorkflowVersionTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            <th className="px-4 py-3.5">Version</th>
            <th className="px-4 py-3.5">Status</th>
            <th className="px-4 py-3.5">Created Date</th>
            <th className="px-4 py-3.5">Created By</th>
            <th className="px-4 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-medium">
          {versions.map((ver, idx) => {
            const versionNum = ver.versionNumber || ver.version || idx + 1;
            const isCurrent = currentVersion === versionNum;

            return (
              <tr key={ver.id || idx} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-100 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      v{versionNum}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                        <Globe className="h-3 w-3" /> Published
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <WorkflowStatusBadge status={ver.status || (isCurrent ? "ACTIVE" : "DRAFT")} size="sm" />
                </td>
                <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                  {ver.createdAt ? new Date(ver.createdAt).toLocaleString() : "N/A"}
                </td>
                <td className="px-4 py-3.5 text-slate-300 font-mono text-[11px]">
                  {ver.createdBy || "System Admin"}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {!isCurrent && onPublish && (
                      <button
                        onClick={() => onPublish(versionNum)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all text-[11px] font-semibold flex items-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        <span>Publish</span>
                      </button>
                    )}
                    {onClone && (
                      <button
                        onClick={() => onClone(versionNum)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Clone</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
