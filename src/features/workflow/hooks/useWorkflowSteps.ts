"use client";

import { useState } from "react";
import { UpdateExecutionStepInput } from "../../../types/workflow.dto";

export function useWorkflowSteps() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeStep = async (executionId: string, data: UpdateExecutionStepInput) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/workflows/executions/${executionId}/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to execute step");
      }
      return json.data;
    } catch (err: any) {
      setError(err.message || "Failed to execute step");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeStep = async (
    executionId: string,
    stepId: string,
    stepName: string,
    output?: Record<string, any>,
    durationMs = 0
  ) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/workflows/executions/${executionId}/steps/${stepId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepName, output, durationMs }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to complete step");
      }
      return json.data;
    } catch (err: any) {
      setError(err.message || "Failed to complete step");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const failStep = async (
    executionId: string,
    stepId: string,
    stepName: string,
    errorDetails: string,
    durationMs = 0
  ) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/workflows/executions/${executionId}/steps/${stepId}/fail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepName, error: errorDetails, durationMs }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fail step");
      }
      return json.data;
    } catch (err: any) {
      setError(err.message || "Failed to fail step");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const skipStep = async (executionId: string, stepId: string, stepName: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/workflows/executions/${executionId}/steps/${stepId}/skip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepName }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to skip step");
      }
      return json.data;
    } catch (err: any) {
      setError(err.message || "Failed to skip step");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    executeStep,
    completeStep,
    failStep,
    skipStep,
  };
}
