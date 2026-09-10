"use client";

import React from "react";
import { Cpu, CheckCircle2, Clock, ArrowRight, Sparkles, Layers } from "lucide-react";
import Link from "next/link";

export const AIRecentJobsSummary: React.FC = () => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl overflow-hidden font-sans space-y-4 p-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">Active AI Job Stream</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time status of catalog enrichment and generation pipelines</p>
          </div>
        </div>

        <Link
          href="/ai/jobs"
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          View Execution Queue &rarr;
        </Link>
      </div>

      <div className="py-8 text-center space-y-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
        <Sparkles className="h-8 w-8 text-purple-400 mx-auto animate-pulse" />
        <h4 className="text-sm font-bold text-white">AI Engine Standing By</h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          No background AI jobs currently executing for this tenant. Use the Content Studio or Single Generator to launch a new enrichment task.
        </p>
        <div className="pt-2">
          <Link
            href="/ai/content"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500 transition-all"
          >
            <span>Launch Content Studio</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
