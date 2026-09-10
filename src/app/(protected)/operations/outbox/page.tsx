"use client";

/**
 * ============================================================================
 * Splinci Commerce OS — Outbox Queue Administration Workspace Page
 * ============================================================================
 * Specification Reference: M12-004 / UI-001
 * Outbox Queue Monitoring & Manual Retry/Purge Administration Workspace
 * ============================================================================
 */

import React, { useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Inbox, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { useOutboxOperations } from "@/features/operations/hooks/useOutboxOperations";
import { OutboxTable } from "@/features/operations/components/OutboxTable";
import { LoadingSkeleton, ErrorState } from "@/features/operations/components/StateComponents";

export default function OutboxOperationsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const { messages, queueHealth, failures, loading, error, refresh, retryMessage, purgeProcessedMessages } = useOutboxOperations({
    status: selectedStatus || undefined,
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <PageHero title="Outbox Administration Workspace" description="Transactional outbox queue monitoring, event retries & historical purges" />
        <LoadingSkeleton title="Loading Outbox Event Queue..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <PageHero title="Outbox Administration Workspace" description="Transactional outbox queue monitoring, event retries & historical purges" />
        <ErrorState message={error} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHero
        title="Outbox Administration Workspace"
        description="Transactional outbox queue monitoring, event retries & historical message purging"
        actions={
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
          </button>
        }
      />

      {/* Queue Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
          <span className="text-slate-400 font-semibold uppercase">Queue Health Status</span>
          <div className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
            {queueHealth?.isHealthy ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> HEALTHY
              </span>
            ) : (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> ATTENTION REQUIRED
              </span>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
          <span className="text-slate-400 font-semibold uppercase">Pending Dispatch</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{queueHealth?.pendingCount ?? 0}</div>
        </div>

        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
          <span className="text-slate-400 font-semibold uppercase">Failed Delivery</span>
          <div className="text-2xl font-bold text-red-400 mt-1">{queueHealth?.failedCount ?? 0}</div>
        </div>

        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
          <span className="text-slate-400 font-semibold uppercase">Processed Successfully</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{queueHealth?.processedCount ?? 0}</div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
        <span className="text-slate-400 font-semibold">Filter by Status:</span>
        <button
          onClick={() => setSelectedStatus("")}
          className={`px-3 py-1 rounded-lg font-medium transition ${!selectedStatus ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"}`}
        >
          All
        </button>
        <button
          onClick={() => setSelectedStatus("FAILED")}
          className={`px-3 py-1 rounded-lg font-medium transition ${selectedStatus === "FAILED" ? "bg-red-600 text-white" : "bg-slate-800 text-slate-300"}`}
        >
          Failed
        </button>
        <button
          onClick={() => setSelectedStatus("PENDING")}
          className={`px-3 py-1 rounded-lg font-medium transition ${selectedStatus === "PENDING" ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-300"}`}
        >
          Pending
        </button>
        <button
          onClick={() => setSelectedStatus("PROCESSED")}
          className={`px-3 py-1 rounded-lg font-medium transition ${selectedStatus === "PROCESSED" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300"}`}
        >
          Processed
        </button>
      </div>

      <OutboxTable
        messages={messages}
        onRetry={retryMessage}
        onPurge={purgeProcessedMessages}
        onRefresh={refresh}
      />
    </div>
  );
}
