"use client";

import { useState, useCallback } from "react";
import { GenerateContentInput } from "@/types/ai-catalog.dto";

export function useAIContent(productId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const generateContent = useCallback(async (input: GenerateContentInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to generate AI content");
      }
      setGeneratedContent(json.data);
      return json.data;
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveContent = useCallback(async (recommendationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/content/${recommendationId}/approve`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to approve AI content");
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
    generatedContent,
    generateContent,
    approveContent,
  };
}
