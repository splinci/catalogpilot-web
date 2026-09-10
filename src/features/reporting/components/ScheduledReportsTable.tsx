"use client";

import { Play, Trash2, Pencil, CalendarClock, CheckCircle, PauseCircle } from "lucide-react";
import type { ScheduledReport } from "../hooks/useScheduledReports";

interface ScheduledReportsTableProps {
  data: ScheduledReport[];
  onRun: (id: string) => void;
  onDelete: (id: string) => void;
  onToggle?: (id: string, isActive: boolean) => void;
  runningId?: string | null;
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
      <CheckCircle className="h-3 w-3" />ACTIVE
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-500">
      <PauseCircle className="h-3 w-3" />PAUSED
    </span>
  );
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  SALES: "Sales", INVENTORY: "Inventory", PURCHASING: "Purchasing",
  FINANCE: "Finance", CRM: "CRM", EXECUTIVE: "Executive", ANALYTICS: "Analytics",
};

const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: "Daily", WEEKLY: "Weekly", MONTHLY: "Monthly", QUARTERLY: "Quarterly",
};

export function ScheduledReportsTable({ data, onRun, onDelete, onToggle, runningId }: ScheduledReportsTableProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs p-12 text-center">
        <CalendarClock className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <p className="font-bold text-slate-500 text-sm">No scheduled reports yet.</p>
        <p className="text-xs text-slate-400 mt-1">Create a schedule to automate report delivery.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["Name", "Type", "Frequency", "Status", "Last Run", "Next Run", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-800">{s.name}</td>
                <td className="px-4 py-3 text-slate-600">{REPORT_TYPE_LABELS[s.reportType] ?? s.reportType}</td>
                <td className="px-4 py-3 text-slate-600">{FREQUENCY_LABELS[s.frequency] ?? s.frequency}</td>
                <td className="px-4 py-3"><StatusBadge isActive={s.isActive} /></td>
                <td className="px-4 py-3 text-slate-500 text-xs">{s.lastRunAt ? new Date(s.lastRunAt).toLocaleDateString() : "Never"}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{s.nextRunAt ? new Date(s.nextRunAt).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onRun(s.id)}
                      disabled={runningId === s.id}
                      title="Run Now"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all cursor-pointer disabled:opacity-40"
                    >
                      <Play className="h-3.5 w-3.5" />
                    </button>
                    {onToggle && (
                      <button
                        onClick={() => onToggle(s.id, !s.isActive)}
                        title={s.isActive ? "Pause" : "Activate"}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all cursor-pointer"
                      >
                        {s.isActive ? <PauseCircle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(s.id)}
                      title="Delete"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
