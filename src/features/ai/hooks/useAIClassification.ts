"use client";

import { useState, useCallback } from "react";
import { ClassifyProductInput } from "@/types/ai-catalog.dto";

export function useAIClassification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classification, setClassification] = useState<any>(null);

  const classifyProduct = useCallback(async (input: ClassifyProductInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/classification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to classify product");
      }
      setClassification(json.data);
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
    classification,
    classifyProduct,
  };
}
