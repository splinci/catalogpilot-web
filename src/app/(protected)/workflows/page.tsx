"use client";

import React, { useState } from "react";
import { Zap, Plus, Search, Filter, RefreshCw, Layers } from "lucide-react";
import { useWorkflows } from "@/features/workflow/hooks/useWorkflows";
import { useWorkflowAnalytics } from "@/features/workflow/hooks/useWorkflowAnalytics";
import {
  WorkflowKPICards,
  WorkflowTable,
  CreateWorkflowModal,
  WorkflowDetailsDrawer,
  LoadingSkeleton,
  ErrorState,
  EmptyState,
} from "@/features/workflow/components";

export default function WorkflowsPage() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedWorkflow, setSelectedWorkflow] = useState<any | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    workflows,
    isLoading,
    error,
    refetch,
    createWorkflow,
    activateWorkflow,
    deactivateWorkflow,
    archiveWorkflow,
  } = useWorkflows({ search, workflowType: (selectedType || undefined) as any });

  const { analytics } = useWorkflowAnalytics();

  const handleCreate = async (data: any) => {
    await createWorkflow(data);
    await refetch();
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
            <Zap className="h-6 w-6 text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Workflow Automation</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Enterprise event-driven process engine & business policy orchestration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create Workflow</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <WorkflowKPICards stats={analytics?.summary} />

      {/* Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workflows by name..."
            className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <Filter className="h-3.5 w-3.5 text-indigo-400" />
            <span>Type:</span>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-semibold"
          >
            <option value="">All Workflow Types</option>
            <option value="CATALOG_REVIEW">Catalog Review</option>
            <option value="INVENTORY_RESTOCK">Inventory Restock</option>
            <option value="PO_APPROVAL">PO Approval</option>
            <option value="ORDER_FULFILLMENT">Order Fulfillment</option>
            <option value="PRICE_UPDATE">Price Update</option>
            <option value="CUSTOM_AUTOMATION">Custom Automation</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => refetch()} />
      ) : workflows.length === 0 ? (
        <EmptyState
          title="No Workflow Definitions Found"
          description="Get started by creating your first automated business policy workflow."
          actionLabel="Create Workflow"
          onAction={() => setIsCreateOpen(true)}
          icon={Zap}
        />
      ) : (
        <WorkflowTable
          workflows={workflows}
          onSelect={(wf) => setSelectedWorkflow(wf)}
          onActivate={(id) => activateWorkflow(id)}
          onDeactivate={(id) => deactivateWorkflow(id)}
          onArchive={(id) => archiveWorkflow(id)}
        />
      )}

      {/* Drawers & Modals */}
      <CreateWorkflowModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <WorkflowDetailsDrawer
        workflow={selectedWorkflow}
        onClose={() => setSelectedWorkflow(null)}
      />
    </div>
  );
}
