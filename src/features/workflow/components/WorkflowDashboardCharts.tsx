"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

interface WorkflowDashboardChartsProps {
  breakdown?: {
    byWorkflowType?: Record<string, number>;
    byTriggerType?: Record<string, number>;
  };
}

export function WorkflowDashboardCharts({ breakdown }: WorkflowDashboardChartsProps) {
  const typeData = Object.entries(breakdown?.byWorkflowType || {}).map(([key, value]) => ({
    name: key.replace("_", " "),
    count: value,
  }));

  const triggerData = Object.entries(breakdown?.byTriggerType || {}).map(([key, value]) => ({
    name: key,
    value: value,
  }));

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#3b82f6"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Workflow Type Distribution */}
      <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Executions by Workflow Type
        </h3>
        <div className="h-64 w-full">
          {typeData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              No type breakdown data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Trigger Type Distribution */}
      <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Executions by Trigger Category
        </h3>
        <div className="h-64 w-full">
          {triggerData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              No trigger breakdown data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={triggerData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {triggerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
