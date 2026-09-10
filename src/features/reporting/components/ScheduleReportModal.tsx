"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { CreateSchedulePayload } from "../hooks/useScheduledReports";

const REPORT_TYPES = [
  { value: "SALES", label: "Sales Report" },
  { value: "INVENTORY", label: "Inventory Report" },
  { value: "PURCHASING", label: "Purchasing Report" },
  { value: "FINANCE", label: "Finance Report" },
  { value: "CRM", label: "CRM Analytics" },
  { value: "EXECUTIVE", label: "Executive Dashboard" },
  { value: "ANALYTICS", label: "Advanced Analytics" },
];

const FREQUENCIES = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
];

interface ScheduleReportModalProps {
  onClose: () => void;
  onCreate: (payload: CreateSchedulePayload) => Promise<any>;
}

export function ScheduleReportModal({ onClose, onCreate }: ScheduleReportModalProps) {
  const [name, setName] = useState("");
  const [reportType, setReportType] = useState("SALES");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [recipients, setRecipients] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Report name is required."); return; }
    setLoading(true);
    setError(null);
    try {
      await onCreate({
        name: name.trim(),
        reportType,
        frequency,
        recipients: recipients ? recipients.split(",").map((s) => s.trim()).filter(Boolean) : [],
        isActive: true,
      });
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Failed to create schedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-black text-slate-900">Schedule a Report</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Report Name <span className="text-rose-500">*</span></label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monthly Executive Summary"
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {REPORT_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Recipients (comma-separated emails)</label>
            <input
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="ceo@company.com, cfo@company.com"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-slate-950 py-2.5 text-sm font-bold text-white hover:bg-indigo-600 transition-all cursor-pointer disabled:opacity-50">
              {loading ? "Creating..." : "Create Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
