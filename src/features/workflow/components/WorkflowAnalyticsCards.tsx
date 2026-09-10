"use client";

import React from "react";
import { Activity, CheckCircle, XCircle, Clock, Zap, BarChart3 } from "lucide-react";

interface WorkflowAnalyticsCardsProps {
  summary?: {
    totalExecutions?: number;
    completedExecutions?: number;
    failedExecutions?: number;
    runningExecutions?: number;
    averageDurationMs?: number;
    successRate?: number;
  };
}

export function WorkflowAnalyticsCards({ summary }: WorkflowAnalyticsCardsProps) {
  const items = [
    {
      title: "Total Executions",
      value: summary?.totalExecutions ?? 0,
      icon: Activity,
      color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
    },
    {
      title: "Completed",
      value: summary?.completedExecutions ?? 0,
      icon: CheckCircle,
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    },
    {
      title: "Failed",
      value: summary?.failedExecutions ?? 0,
      icon: XCircle,
      color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    },
    {
      title: "Average Duration",
      value: `${summary?.averageDurationMs ?? 0}ms`,
      icon: Clock,
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    },
    {
      title: "Overall Success Rate",
      value: `${(summary?.successRate ?? 0).toFixed(1)}%`,
      icon: BarChart3,
      color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {items.map((it, idx) => {
        const Icon = it.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-xl flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {it.title}
              </span>
              <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-100 font-mono">
                {it.value}
              </div>
            </div>
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${it.color}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
