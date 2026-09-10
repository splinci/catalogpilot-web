"use client";

import React from "react";
import { DollarSign, Cpu, Zap } from "lucide-react";

interface AICostCardProps {
  estimatedCostUSD?: number;
  tokensToday?: number;
  remainingDailyQuota?: number;
}

export const AICostCard: React.FC<AICostCardProps> = ({
  estimatedCostUSD = 0.105,
  tokensToday = 52500,
  remainingDailyQuota = 958,
}) => {
  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Execution Economics</h3>
        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-black text-white tracking-tight">
          ${estimatedCostUSD.toFixed(4)}
        </div>
        <p className="text-xs text-slate-400 mt-1">Estimated Operational Cost Today</p>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
        <div>
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold">Tokens Today</span>
          </div>
          <span className="font-bold text-slate-100 tabular-nums">{tokensToday.toLocaleString()} tokens</span>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">Remaining Quota</span>
          </div>
          <span className="font-bold text-slate-100 tabular-nums">{remainingDailyQuota} jobs</span>
        </div>
      </div>
    </div>
  );
};
