/**
 * ============================================================================
 * Splinci Commerce OS — OutboxTable Component
 * ============================================================================
 * Specification Reference: M12-004 / UI-001
 * Displays outbox queue messages with manual retry & purge trigger actions
 * ============================================================================
 */

import React, { useState } from "react";
import { Inbox, RefreshCw, Trash2, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

export function OutboxTable({
  messages,
  onRetry,
  onPurge,
  onRefresh,
}: {
  messages: any[];
  onRetry: (id: string) => Promise<void>;
  onPurge?: (days: number) => Promise<void>;
  onRefresh?: () => void;
}) {
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [purging, setPurging] = useState(false);
  const [confirmPurgeOpen, setConfirmPurgeOpen] = useState(false);

  const handleRetry = async (id: string) => {
    setRetryingId(id);
    try {
      await onRetry(id);
    } catch (err: any) {
      alert(err.message || "Outbox retry failed");
    } finally {
      setRetryingId(null);
    }
  };

  const handlePurge = async () => {
    if (!onPurge) return;
    setPurging(true);
    try {
      await onPurge(7);
      setConfirmPurgeOpen(false);
    } catch (err: any) {
      alert(err.message || "Outbox purge failed");
    } finally {
      setPurging(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROCESSED":
        return <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-[10px] font-bold">PROCESSED</span>;
      case "FAILED":
        return <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 rounded-full text-[10px] font-bold">FAILED</span>;
      case "PENDING":
        return <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded-full text-[10px] font-bold">PENDING</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-full text-[10px] font-bold">{status}</span>;
    }
  };

  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-slate-100 font-semibold text-base">Outbox Event Delivery Queue</h3>
            <p className="text-slate-400 text-xs">Asynchronous transactional event dispatcher monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onPurge && (
            <button
              onClick={() => setConfirmPurgeOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800 rounded-lg text-xs font-medium transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Purge Old Messages
            </button>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Purge */}
      {confirmPurgeOpen && (
        <div className="p-4 bg-red-950/80 border border-red-800 rounded-xl text-xs space-y-3">
          <div className="flex items-center gap-2 text-red-200 font-semibold">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Confirm Outbox Queue Purge</span>
          </div>
          <p className="text-red-300/90">
            Are you sure you want to purge all successfully processed outbox messages older than 7 days? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setConfirmPurgeOpen(false)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handlePurge}
              disabled={purging}
              className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white font-semibold rounded text-xs"
            >
              {purging ? "Purging..." : "Confirm Purge"}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700/50">
            <tr>
              <th className="py-2.5 px-3">Event Type</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Retry Count</th>
              <th className="py-2.5 px-3">Created At</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {messages.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  Outbox queue is empty.
                </td>
              </tr>
            ) : (
              messages.map((msg) => (
                <tr key={msg.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-semibold text-slate-200">{msg.eventType}</td>
                  <td className="py-3 px-3">{getStatusBadge(msg.status)}</td>
                  <td className="py-3 px-3 text-slate-300">{msg.retryCount ?? 0} / 5</td>
                  <td className="py-3 px-3 text-slate-400">{new Date(msg.createdAt).toLocaleString()}</td>
                  <td className="py-3 px-3 text-right">
                    {msg.status !== "PROCESSED" && (
                      <button
                        onClick={() => handleRetry(msg.id)}
                        disabled={retryingId === msg.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-semibold transition disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${retryingId === msg.id ? "animate-spin" : ""}`} /> Retry
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
