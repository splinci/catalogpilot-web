"use client";

import { Brain, CheckCircle, Zap, Star } from "lucide-react";

interface AIUsageSummaryCardProps {
  jobsRun?: number;
  enrichmentRate?: number;
  classificationAccuracy?: number;
  contentApproved?: number;
}

function AIMetricRow({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-800/60 last:border-0">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs font-semibold text-slate-300">{label}</span>
      </div>
      <span className="font-black text-white tabular-nums text-xs">{value}</span>
    </div>
  );
}

export function AIUsageSummaryCard({ jobsRun, enrichmentRate, classificationAccuracy, contentApproved }: AIUsageSummaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800 bg-purple-500/10">
        <Brain className="h-4 w-4 text-purple-400" />
        <h3 className="font-bold text-xs text-purple-300 uppercase tracking-wider">AI Catalog Intelligence Summary</h3>
      </div>
      <div className="px-5 py-2">
        <AIMetricRow label="AI Jobs Executed" value={jobsRun?.toLocaleString() ?? "—"} icon={Zap} color="text-purple-400" />
        <AIMetricRow label="Enrichment Coverage" value={enrichmentRate != null ? `${enrichmentRate.toFixed(1)}%` : "—"} icon={CheckCircle} color="text-emerald-400" />
        <AIMetricRow label="Classification Accuracy" value={classificationAccuracy != null ? `${classificationAccuracy.toFixed(1)}%` : "—"} icon={Star} color="text-amber-400" />
        <AIMetricRow label="Content Items Approved" value={contentApproved?.toLocaleString() ?? "—"} icon={CheckCircle} color="text-sky-400" />
      </div>
    </div>
  );
}
