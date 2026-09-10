"use client";

import React from "react";
import { Zap, Activity, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";

interface WorkflowKPICardsProps {
  stats?: {
    totalWorkflows?: number;
    activeWorkflows?: number;
    runningExecutions?: number;
    completedExecutions?: number;
    failedExecutions?: number;
    successRate?: number;
  };
}

export function WorkflowKPICards({ stats }: WorkflowKPICardsProps) {
  const cards = [
    {
      title: "Total Workflows",
      value: stats?.totalWorkflows ?? 0,
      icon: Zap,
      color: "from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30",
    },
    {
      title: "Active Workflows",
      value: stats?.activeWorkflows ?? 0,
      icon: Activity,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    },
    {
      title: "Running Executions",
      value: stats?.runningExecutions ?? 0,
      icon: Clock,
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    },
    {
      title: "Completed Executions",
      value: stats?.completedExecutions ?? 0,
      icon: CheckCircle2,
      color: "from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30",
    },
    {
      title: "Failed Executions",
      value: stats?.failedExecutions ?? 0,
      icon: XCircle,
      color: "from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30",
    },
    {
      title: "Success Rate",
      value: `${(stats?.successRate ?? 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: "from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-4 rounded-2xl bg-gradient-to-br border bg-slate-900/60 backdrop-blur-md shadow-lg transition-all hover:scale-[1.02] ${c.color}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {c.title}
              </span>
              <Icon className="h-4 w-4 shrink-0" />
            </div>
            <div className="mt-2 text-xl font-black tracking-tight text-slate-100">
              {c.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
