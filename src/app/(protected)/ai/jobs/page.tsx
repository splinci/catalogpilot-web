"use client";

import React, { useState } from "react";
import { Cpu, Plus, RotateCw } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { useAIJobs } from "@/features/ai/hooks/useAIJobs";
import { AIJobTable } from "@/features/ai/components/AIJobTable";

export default function AIJobsWorkspacePage() {
  const { jobs, loading, error, refetch, createJob, startJob, cancelJob, retryJob } = useAIJobs();
  const [fileUrl, setFileUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl) return;
    setIsCreating(true);
    try {
      await createJob({
        type: "BULK_ENRICHMENT",
        fileUrl,
      });
      setFileUrl("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHero
        title="AI Execution Queue"
        description="Manage background AI bulk enrichment jobs, execution queues, and retries."
        badge="AI Execution Engine"
        actions={
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 px-4 py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <RotateCw className="w-4 h-4 text-purple-400" /> Refresh Queue
          </button>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
          {error}
        </div>
      )}

      {/* New Job Form */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Create Bulk AI Execution Job
        </h2>
        <form onSubmit={handleCreateJob} className="flex gap-3">
          <input
            type="text"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="Target SKU or catalog import batch URL..."
            required
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isCreating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            {isCreating ? "Enqueueing..." : "Enqueue Job"}
          </button>
        </form>
      </div>

      {/* Jobs Table */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Execution Queue &amp; History
        </h2>
        <AIJobTable
          jobs={jobs}
          loading={loading}
          onStart={startJob}
          onRetry={retryJob}
          onCancel={cancelJob}
        />
      </div>
    </div>
  );
}
