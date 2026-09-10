"use client";

import { useState, useEffect, useCallback } from "react";
import { PromptTemplateInput } from "@/types/ai-catalog.dto";

export function usePromptTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/prompts");
      const json = await res.json();
      if (json.success) {
        setTemplates(json.data || []);
      } else {
        throw new Error(json.error || "Failed to fetch prompt templates");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = useCallback(async (input: PromptTemplateInput) => {
    try {
      const res = await fetch("/api/ai/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      await fetchTemplates();
      return json.data;
    } catch (err: any) {
      throw err;
    }
  }, [fetchTemplates]);

  const publishTemplate = useCallback(async (templateId: string) => {
    try {
      const res = await fetch(`/api/ai/prompts/${templateId}/publish`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      await fetchTemplates();
      return json.data;
    } catch (err: any) {
      throw err;
    }
  }, [fetchTemplates]);

  const cloneTemplate = useCallback(async (templateId: string, newCode?: string) => {
    try {
      const res = await fetch(`/api/ai/prompts/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: newCode }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      await fetchTemplates();
      return json.data;
    } catch (err: any) {
      throw err;
    }
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
    createTemplate,
    publishTemplate,
    cloneTemplate,
  };
}
