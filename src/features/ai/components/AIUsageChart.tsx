"use client";

import React from "react";
import { BarChart3, PieChart, ShieldCheck } from "lucide-react";

interface AIUsageChartProps {
  analytics?: any;
}

export const AIUsageChart: React.FC<AIUsageChartProps> = ({ analytics }) => {
  const quality = analytics?.quality || {
    averageQualityScore: 0,
    highQualityCount: 0,
    mediumQualityCount: 0,
    lowQualityCount: 0,
  };

  const approval = analytics?.approval || {
    autoApprovalRate: 0,
    humanApprovalRate: 0,
  };

  const hasData = quality.highQualityCount > 0 || quality.mediumQualityCount > 0 || quality.lowQualityCount > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
      {/* Quality Score Breakdown */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            Quality Distribution Breakdown
          </h3>
          <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
            Avg: {hasData ? `${quality.averageQualityScore}/100` : "—"}
          </span>
        </div>

        {hasData ? (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span className="font-semibold">High Quality (80–100 Score)</span>
                <span className="font-bold text-emerald-400">{quality.highQualityCount} Products</span>
              </div>
              <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span className="font-semibold">Medium Quality (60–79 Score)</span>
                <span className="font-bold text-amber-400">{quality.mediumQualityCount} Products</span>
              </div>
              <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "0%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span className="font-semibold">Requires Attention (&lt; 60 Score)</span>
                <span className="font-bold text-rose-400">{quality.lowQualityCount} Products</span>
              </div>
              <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: "0%" }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No product quality distributions recorded for current tenant.
          </div>
        )}
      </div>

      {/* Approval Velocity */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-400" />
            AI Approval Velocity %
          </h3>
          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
            Threshold: 0.95
          </span>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Auto-Approved Proposals
            </div>
            <span className="text-lg font-black text-emerald-400 tabular-nums">{hasData ? `${approval.autoApprovalRate}%` : "—"}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              Manual Catalog Review Required
            </div>
            <span className="text-lg font-black text-amber-400 tabular-nums">{hasData ? `${approval.humanApprovalRate}%` : "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
