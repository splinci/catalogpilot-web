"use client";

import { useState } from "react";
import { Plus, RefreshCw, AlertCircle, CheckCircle, CalendarClock } from "lucide-react";
import { useScheduledReports } from "@/features/reporting/hooks/useScheduledReports";
import { ScheduledReportsTable } from "@/features/reporting/components/ScheduledReportsTable";
import { ScheduleReportModal } from "@/features/reporting/components/ScheduleReportModal";
import { ErrorState } from "@/features/reporting/components/EmptyState";
import { TableSkeleton } from "@/features/reporting/components/LoadingSkeleton";

export default function ReportingScheduledPage() {
  const { data: schedules, loading, error, refetch, createSchedule, updateSchedule, deleteSchedule, runSchedule } = useScheduledReports();
  const [showModal, setShowModal] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRun = async (id: string) => {
    setRunningId(id);
    try {
      await runSchedule(id);
      showToast("success", "Scheduled report execution triggered.");
    } catch (e: any) {
      showToast("error", e.message ?? "Run failed");
    } finally {
      setRunningId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    try {
      await deleteSchedule(id);
      showToast("success", "Schedule deleted.");
    } catch (e: any) {
      showToast("error", e.message ?? "Delete failed");
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await updateSchedule(id, { isActive });
      showToast("success", `Schedule ${isActive ? "activated" : "paused"}.`);
    } catch (e: any) {
      showToast("error", e.message ?? "Update failed");
    }
  };

  return (
    <div className="space-y-8">
      {showModal && <ScheduleReportModal onClose={() => setShowModal(false)} onCreate={createSchedule} />}

      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold shadow-lg transition-all ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
          {toast.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Scheduled Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Automate report generation and delivery to stakeholders.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refetch} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-600 transition-all cursor-pointer shadow-sm">
            <Plus className="h-4 w-4" />New Schedule
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={refetch} />}

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Schedules</p>
          <p className="text-2xl font-black text-slate-900">{loading ? "—" : schedules.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active</p>
          <p className="text-2xl font-black text-emerald-600">{loading ? "—" : schedules.filter(s => s.isActive).length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Paused</p>
          <p className="text-2xl font-black text-amber-600">{loading ? "—" : schedules.filter(s => !s.isActive).length}</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : (
        <ScheduledReportsTable
          data={schedules}
          onRun={handleRun}
          onDelete={handleDelete}
          onToggle={handleToggle}
          runningId={runningId}
        />
      )}
    </div>
  );
}
