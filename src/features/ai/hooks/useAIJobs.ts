"use client";

import { useState, useEffect, useCallback } from "react";
import { CreateAIJobInput } from "@/types/ai-catalog.dto";

export function useAIJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/jobs");
      const json = await res.json();
      if (json.success) {
        setJobs(json.data || []);
      } else {
        throw new Error(json.error || "Failed to fetch jobs");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const createJob = useCallback(async (input: CreateAIJobInput) => {
    try {
      const res = await fetch("/api/ai/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create AI job");
      }
      await fetchJobs();
      return json.data;
    } catch (err: any) {
      throw err;
    }
  }, [fetchJobs]);

  const startJob = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(`/api/ai/jobs/${jobId}/start`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      await fetchJobs();
      return json.data;
    } catch (err: any) {
      throw err;
    }
  }, [fetchJobs]);

  const cancelJob = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(`/api/ai/jobs/${jobId}/cancel`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      await fetchJobs();
      return json.data;
    } catch (err: any) {
      throw err;
    }
  }, [fetchJobs]);

  const retryJob = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(`/api/ai/jobs/${jobId}/retry`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      await fetchJobs();
      return json.data;
    } catch (err: any) {
      throw err;
    }
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    refetch: fetchJobs,
    createJob,
    startJob,
    cancelJob,
    retryJob,
  };
}
