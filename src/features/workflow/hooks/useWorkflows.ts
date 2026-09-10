"use client";

import { useState, useCallback, useEffect } from "react";
import {
  CreateWorkflowInput,
  UpdateWorkflowInput,
  WorkflowQueryInput,
} from "../../../types/workflow.dto";

export function useWorkflows(initialQuery?: Partial<WorkflowQueryInput>) {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = initialQuery?.page;
  const limit = initialQuery?.limit;
  const search = initialQuery?.search;
  const workflowType = initialQuery?.workflowType;
  const isActive = initialQuery?.isActive;

  const fetchWorkflows = useCallback(async (query?: Partial<WorkflowQueryInput>) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      const qPage = query?.page ?? page;
      const qLimit = query?.limit ?? limit;
      const qSearch = query?.search ?? search;
      const qWorkflowType = query?.workflowType ?? workflowType;
      const qIsActive = query?.isActive ?? isActive;

      if (qPage) params.set("page", String(qPage));
      if (qLimit) params.set("limit", String(qLimit));
      if (qSearch) params.set("search", qSearch);
      if (qWorkflowType) params.set("workflowType", qWorkflowType);
      if (qIsActive !== undefined) params.set("isActive", String(qIsActive));

      const res = await fetch(`/api/workflows?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch workflows");
      }

      setWorkflows(json.data || []);
      if (json.pagination) {
        setPagination(json.pagination);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch workflows");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, workflowType, isActive]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const createWorkflow = async (data: CreateWorkflowInput) => {
    const res = await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to create workflow");
    }
    await fetchWorkflows();
    return json.data;
  };

  const updateWorkflow = async (id: string, data: UpdateWorkflowInput) => {
    const res = await fetch(`/api/workflows/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to update workflow");
    }
    await fetchWorkflows();
    return json.data;
  };

  const activateWorkflow = async (id: string) => {
    const res = await fetch(`/api/workflows/${id}/activate`, { method: "POST" });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to activate workflow");
    }
    await fetchWorkflows();
    return json.data;
  };

  const deactivateWorkflow = async (id: string) => {
    const res = await fetch(`/api/workflows/${id}/deactivate`, { method: "POST" });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to deactivate workflow");
    }
    await fetchWorkflows();
    return json.data;
  };

  const archiveWorkflow = async (id: string) => {
    const res = await fetch(`/api/workflows/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to archive workflow");
    }
    await fetchWorkflows();
    return json.data;
  };

  return {
    workflows,
    pagination,
    isLoading,
    error,
    refetch: fetchWorkflows,
    createWorkflow,
    updateWorkflow,
    activateWorkflow,
    deactivateWorkflow,
    archiveWorkflow,
  };
}
