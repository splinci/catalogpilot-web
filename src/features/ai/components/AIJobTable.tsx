"use client";

import React from "react";
import { Play, RotateCw, XCircle, CheckCircle, Clock, Cpu } from "lucide-react";

interface AIJobTableProps {
  jobs: any[];
  loading?: boolean;
  onStart?: (jobId: string) => void;
  onRetry?: (jobId: string) => void;
  onCancel?: (jobId: string) => void;
}

export const AIJobTable: React.FC<AIJobTableProps> = ({
  jobs,
  loading = false,
  onStart,
  onRetry,
  onCancel,
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800 animate-pulse text-xs font-semibold">
        Loading AI execution queue...
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
        <Cpu className="w-10 h-10 text-purple-400 mx-auto mb-3 opacity-60" />
        <h3 className="text-xs font-bold text-slate-300">No active AI jobs</h3>
        <p className="text-xs text-slate-400 mt-1">
          Create an AI job to initiate automated catalog enrichment.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-950/90 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
          <tr>
            <th className="px-6 py-3.5">Job ID</th>
            <th className="px-6 py-3.5">Status</th>
            <th className="px-6 py-3.5">Target File / SKU</th>
            <th className="px-6 py-3.5">Recommendations</th>
            <th className="px-6 py-3.5">Created At</th>
            <th className="px-6 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-medium">
          {jobs.map((job) => {
            const isCompleted = job.status === "COMPLETED";
            const isFailed = job.status === "FAILED";
            const isRunning = job.status === "PROCESSING" || job.status === "RUNNING";

            return (
              <tr key={job.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-purple-400 font-bold">
                  {job.id.slice(-8)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                      isCompleted
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : isFailed
                        ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                        : isRunning
                        ? "text-purple-400 bg-purple-500/10 border-purple-500/20 animate-pulse"
                        : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    }`}
                  >
                    {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                    {isFailed && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                    {isRunning && <RotateCw className="w-3.5 h-3.5 animate-spin text-purple-400" />}
                    {!isCompleted && !isFailed && !isRunning && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{job.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-200 font-semibold">{job.fileUrl}</td>
                <td className="px-6 py-4 text-slate-400 font-medium">
                  {job.recommendations?.length || 0} Proposals
                </td>
                <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                  {new Date(job.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {!isCompleted && !isRunning && onStart && (
                    <button
                      onClick={() => onStart(job.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5" /> Start
                    </button>
                  )}
                  {isFailed && onRetry && (
                    <button
                      onClick={() => onRetry(job.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <RotateCw className="w-3.5 h-3.5" /> Retry
                    </button>
                  )}
                  {isRunning && onCancel && (
                    <button
                      onClick={() => onCancel(job.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
