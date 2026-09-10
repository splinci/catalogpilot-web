"use client";

import React from "react";
import Link from "next/link";
import { Eye, Power, Trash2, ArrowUpRight, Copy } from "lucide-react";
import { WorkflowStatusBadge } from "./WorkflowStatusBadge";

interface WorkflowTableProps {
  workflows: any[];
  onSelect?: (workflow: any) => void;
  onActivate?: (id: string) => void;
  onDeactivate?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export function WorkflowTable({
  workflows,
  onSelect,
  onActivate,
  onDeactivate,
  onArchive,
}: WorkflowTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            <th className="px-4 py-3.5">Workflow</th>
            <th className="px-4 py-3.5">Type</th>
            <th className="px-4 py-3.5">State</th>
            <th className="px-4 py-3.5 text-center">Version</th>
            <th className="px-4 py-3.5">Last Updated</th>
            <th className="px-4 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-medium">
          {workflows.map((wf) => {
            const rules = typeof wf.rules === "object" ? wf.rules : {};
            const code = rules.code || wf.id.substring(0, 8);
            const isActive = wf.isActive;

            return (
              <tr key={wf.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-bold text-xs">
                      {code.substring(0, 4)}
                    </div>
                    <div>
                      <Link
                        href={`/workflows/${wf.id}`}
                        className="font-bold text-slate-100 hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                      >
                        <span>{wf.name}</span>
                        <ArrowUpRight className="h-3 w-3 text-slate-500" />
                      </Link>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{code}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="inline-block rounded-md bg-slate-800 px-2 py-1 text-[11px] font-mono text-slate-300 border border-slate-700">
                    {wf.workflowType}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <WorkflowStatusBadge status={isActive ? "ACTIVE" : "INACTIVE"} size="sm" />
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className="font-mono text-slate-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    v{wf.version || 1}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                  {wf.updatedAt ? new Date(wf.updatedAt).toLocaleDateString() : "N/A"}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {onSelect && (
                      <button
                        onClick={() => onSelect(wf)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {isActive ? (
                      onDeactivate && (
                        <button
                          onClick={() => onDeactivate(wf.id)}
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
                          title="Deactivate Workflow"
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                      )
                    ) : (
                      onActivate && (
                        <button
                          onClick={() => onActivate(wf.id)}
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all"
                          title="Activate Workflow"
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                      )
                    )}
                    {onArchive && (
                      <button
                        onClick={() => onArchive(wf.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
                        title="Archive Workflow"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
