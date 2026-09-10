"use client";

import React, { useState } from "react";
import { ShieldCheck, CheckCircle2, XCircle, Clock } from "lucide-react";

interface WorkflowApprovalPanelProps {
  executionId: string;
  onApprove: (id: string, notes?: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
  onExpire: (id: string, reason?: string) => Promise<void>;
}

export function WorkflowApprovalPanel({
  executionId,
  onApprove,
  onReject,
  onExpire,
}: WorkflowApprovalPanelProps) {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onApprove(executionId, notes);
      setNotes("");
    } catch (err: any) {
      setError(err.message || "Failed to approve");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onReject(executionId, notes);
      setNotes("");
    } catch (err: any) {
      setError(err.message || "Failed to reject");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExpire = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onExpire(executionId, notes);
      setNotes("");
    } catch (err: any) {
      setError(err.message || "Failed to expire");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 text-xs space-y-4 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <ShieldCheck className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <h3 className="font-bold text-amber-200 text-sm">Approval Required</h3>
          <p className="text-slate-400">Execution is awaiting authorized approval decision</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
          {error}
        </div>
      )}

      <div>
        <label className="block text-slate-300 font-semibold mb-1">
          Decision Notes / Rejection Reason
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter authorization notes or justification..."
          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-1">
        <button
          onClick={handleExpire}
          disabled={isSubmitting}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Expire</span>
        </button>
        <button
          onClick={handleReject}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition-all disabled:opacity-50"
        >
          <XCircle className="h-3.5 w-3.5" />
          <span>Reject</span>
        </button>
        <button
          onClick={handleApprove}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Approve</span>
        </button>
      </div>
    </div>
  );
}
