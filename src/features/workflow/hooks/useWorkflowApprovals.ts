"use client";

import { useState } from "react";

export function useWorkflowApprovals() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveExecution = async (executionId: string, notes?: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/workflows/executions/${executionId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to approve execution");
      }
      return json.data;
    } catch (err: any) {
      setError(err.message || "Failed to approve execution");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const rejectExecution = async (executionId: string, reason?: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/workflows/executions/${executionId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to reject execution");
      }
      return json.data;
    } catch (err: any) {
      setError(err.message || "Failed to reject execution");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const expireExecution = async (executionId: string, reason?: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/workflows/executions/${executionId}/expire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to expire execution");
      }
      return json.data;
    } catch (err: any) {
      setError(err.message || "Failed to expire execution");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    approveExecution,
    rejectExecution,
    expireExecution,
  };
}
