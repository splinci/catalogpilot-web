/**
 * ============================================================================
 * Splinci Commerce OS — OperationsDashboardCharts Component
 * ============================================================================
 * Specification Reference: M12-004 / UI-001
 * Displays operational dashboard visual charts using Recharts
 * ============================================================================
 */

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts";

export function OperationsDashboardCharts({
  metrics,
  incidentsSummary,
}: {
  metrics?: any;
  incidentsSummary?: any;
}) {
  if (!metrics) return null;

  const outboxData = [
    { name: "Processed", count: metrics.outbox?.processedCount ?? 0, fill: "#10b981" },
    { name: "Pending", count: metrics.outbox?.pendingCount ?? 0, fill: "#f59e0b" },
    { name: "Failed", count: metrics.outbox?.failedCount ?? 0, fill: "#ef4444" },
  ];

  const aiData = [
    { name: "Completed", count: metrics.aiJobs?.completedCount ?? 0, fill: "#10b981" },
    { name: "Processing", count: metrics.aiJobs?.processingCount ?? 0, fill: "#3b82f6" },
    { name: "Failed", count: metrics.aiJobs?.failedCount ?? 0, fill: "#ef4444" },
  ];

  const wfData = [
    { name: "Approved", count: metrics.workflows?.approvedCount ?? 0, fill: "#10b981" },
    { name: "Pending", count: metrics.workflows?.pendingCount ?? 0, fill: "#f59e0b" },
    { name: "Rejected", count: metrics.workflows?.rejectedCount ?? 0, fill: "#ef4444" },
    { name: "Expired", count: metrics.workflows?.expiredCount ?? 0, fill: "#6b7280" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Outbox Event Queue Distribution */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 space-y-3">
        <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider">Outbox Queue Delivery</h4>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={outboxData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {outboxData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. AI Catalog Background Jobs Status */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 space-y-3">
        <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider">AI Ingestion Jobs</h4>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aiData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {aiData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Workflow Execution Health */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 space-y-3">
        <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider">Workflow Executions</h4>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wfData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {wfData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
