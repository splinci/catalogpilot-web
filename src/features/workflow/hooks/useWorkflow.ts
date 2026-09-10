"use client";

import { useState, useCallback, useEffect } from "react";
import { CreateWorkflowVersionInput } from "../../../types/workflow.dto";

export function useWorkflow(workflowId?: string) {
  const [workflow, setWorkflow] = useState<any | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflow = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [resWf, resVer] = await Promise.all([
        fetch(`/api/workflows/${id}`),
        fetch(`/api/workflows/${id}/versions`),
      ]);

      const jsonWf = await resWf.json();
      const jsonVer = await resVer.json();

      if (!resWf.ok || !jsonWf.success) {
        throw new Error(jsonWf.error || "Failed to fetch workflow detail");
      }

      setWorkflow(jsonWf.data);
      setVersions(jsonVer.success ? jsonVer.data || [] : []);
    } catch (err: any) {
      setError(err.message || "Failed to load workflow");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (workflowId) {
      fetchWorkflow(workflowId);
    }
  }, [workflowId, fetchWorkflow]);

  const createVersion = async (data: CreateWorkflowVersionInput) => {
    if (!workflowId) return;
    const res = await fetch(`/api/workflows/${workflowId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to create version");
    }
    await fetchWorkflow(workflowId);
    return json.data;
  };

  const publishVersion = async (versionNumber: number) => {
    if (!workflowId) return;
    const res = await fetch(`/api/workflows/${workflowId}/versions/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionNumber }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to publish version");
    }
    await fetchWorkflow(workflowId);
    return json.data;
  };

  const cloneVersion = async (versionNumber: number, newName?: string) => {
    if (!workflowId) return;
    const res = await fetch(`/api/workflows/${workflowId}/versions/clone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionNumber, newName }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to clone version");
    }
    return json.data;
  };

  return {
    workflow,
    versions,
    isLoading,
    error,
    refetch: () => workflowId && fetchWorkflow(workflowId),
    createVersion,
    publishVersion,
    cloneVersion,
  };
}
