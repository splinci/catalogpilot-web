"use client";

import { useState } from "react";

export function useWorkflowTriggers() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const evaluateTriggers = async (eventName: string, payload?: Record<string, any>) => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch("/api/workflows/triggers/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventName, payload }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to evaluate triggers");
      }
      setEvaluationResult(json.data);
      return json.data;
    } catch (err: any) {
      setError(err.message || "Failed to evaluate triggers");
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const processTriggerEvent = async (eventName: string, payload?: Record<string, any>) => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch("/api/workflows/triggers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventName, payload }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to process trigger event");
      }
      return json.data;
    } catch (err: any) {
      setError(err.message || "Failed to process trigger event");
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    evaluationResult,
    error,
    evaluateTriggers,
    processTriggerEvent,
  };
}
