"use client";

import { useState, useCallback } from "react";

export function useAIEnrichment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrichment, setEnrichment] = useState<any>(null);

  const enrichProduct = useCallback(async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/enrichment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to enrich product");
      }
      setEnrichment(json.data);
      return json.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveEnrichment = useCallback(async (enrichmentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/enrichment/${enrichmentId}/approve`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to approve enrichment");
      }
      return json.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectEnrichment = useCallback(async (enrichmentId: string, reason?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/enrichment/${enrichmentId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to reject enrichment");
      }
      return json.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    enrichment,
    enrichProduct,
    approveEnrichment,
    rejectEnrichment,
  };
}
