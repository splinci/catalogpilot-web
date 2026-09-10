"use client";

import { useState, useCallback, useEffect } from "react";
import {
  CreateWorkflowExecutionInput,
  WorkflowExecutionQueryInput,
} from "../../../types/workflow.dto";

export function useWorkflowExecutions(initialQuery?: Partial<WorkflowExecutionQueryInput>) {
  const [executions, setExecutions] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = initialQuery?.page;
  const limit = initialQuery?.limit;
  const definitionId = initialQuery?.definitionId;
  const status = initialQuery?.status;
  const triggerEvent = initialQuery?.triggerEvent;

  const fetchExecutions = useCallback(async (query?: Partial<WorkflowExecutionQueryInput>) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      const qPage = query?.page ?? page;
      const qLimit = query?.limit ?? limit;
      const qDefId = query?.definitionId ?? definitionId;
      const qStatus = query?.status ?? status;
      const qTrigger = query?.triggerEvent ?? triggerEvent;

      if (qPage) params.set("page", String(qPage));
      if (qLimit) params.set("limit", String(qLimit));
      if (qDefId) params.set("definitionId", qDefId);
      if (qStatus) params.set("status", qStatus);
      if (qTrigger) params.set("triggerEvent", qTrigger);

      const res = await fetch(`/api/workflows/executions?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch executions");
      }

      setExecutions(json.data || []);
      if (json.pagination) {
        setPagination(json.pagination);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch executions");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, definitionId, status, triggerEvent]);

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  const createExecution = async (data: CreateWorkflowExecutionInput) => {
    const res = await fetch("/api/workflows/executions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to instantiate execution");
    }
    await fetchExecutions();
    return json.data;
  };

  const startExecution = async (id: string) => {
    const res = await fetch(`/api/workflows/executions/${id}/start`, { method: "POST" });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to start execution");
    }
    await fetchExecutions();
    return json.data;
  };

  const completeExecution = async (id: string, metadata?: Record<string, any>) => {
    const res = await fetch(`/api/workflows/executions/${id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metadata }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to complete execution");
    }
    await fetchExecutions();
    return json.data;
  };

  const failExecution = async (id: string, errorDetails?: any) => {
    const res = await fetch(`/api/workflows/executions/${id}/fail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: errorDetails }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to fail execution");
    }
    await fetchExecutions();
    return json.data;
  };

  const cancelExecution = async (id: string) => {
    const res = await fetch(`/api/workflows/executions/${id}/cancel`, { method: "POST" });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to cancel execution");
    }
    await fetchExecutions();
    return json.data;
  };

  const retryExecution = async (id: string) => {
    const res = await fetch(`/api/workflows/executions/${id}/retry`, { method: "POST" });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to retry execution");
    }
    await fetchExecutions();
    return json.data;
  };

  return {
    executions,
    pagination,
    isLoading,
    error,
    refetch: fetchExecutions,
    createExecution,
    startExecution,
    completeExecution,
    failExecution,
    cancelExecution,
    retryExecution,
  };
}
