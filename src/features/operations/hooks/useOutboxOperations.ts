/**
 * ============================================================================
 * Splinci Commerce OS — useOutboxOperations Hook
 * ============================================================================
 * Specification Reference: M12-004 / API-001 / UI-001
 * Consumes: /api/operations/outbox, /api/operations/outbox/[id]/retry,
 *           /api/operations/outbox/purge, /api/operations/outbox/health, /api/operations/outbox/failures
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";

export function useOutboxOperations(params?: { status?: string; eventType?: string; page?: number; limit?: number }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [queueHealth, setQueueHealth] = useState<any>(null);
  const [failures, setFailures] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOutboxData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set("page", params.page.toString());
      if (params?.limit) queryParams.set("limit", params.limit.toString());
      if (params?.status) queryParams.set("status", params.status);
      if (params?.eventType) queryParams.set("eventType", params.eventType);

      const [listRes, healthRes, failuresRes] = await Promise.all([
        fetch(`/api/operations/outbox?${queryParams.toString()}`),
        fetch("/api/operations/outbox/health"),
        fetch("/api/operations/outbox/failures"),
      ]);

      const [listJson, healthJson, failuresJson] = await Promise.all([
        listRes.json(),
        healthRes.json(),
        failuresRes.json(),
      ]);

      if (listJson.success) {
        setMessages(listJson.data.messages || []);
        setTotal(listJson.data.total || 0);
      }
      if (healthJson.success) setQueueHealth(healthJson.data);
      if (failuresJson.success) setFailures(failuresJson.data);
    } catch (err: any) {
      setError(err?.message || "Failed to load outbox queue data");
    } finally {
      setLoading(false);
    }
  }, [params?.page, params?.limit, params?.status, params?.eventType]);

  const retryMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/operations/outbox/${id}/retry`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to retry message");
      }
      await fetchOutboxData();
      return json.data;
    } catch (err: any) {
      throw new Error(err.message || "Outbox retry failed");
    }
  };

  const purgeProcessedMessages = async (daysOlderThan = 7) => {
    try {
      const res = await fetch("/api/operations/outbox/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ daysOlderThan }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to purge outbox");
      }
      await fetchOutboxData();
      return json.data;
    } catch (err: any) {
      throw new Error(err.message || "Outbox purge failed");
    }
  };

  useEffect(() => {
    fetchOutboxData();
  }, [fetchOutboxData]);

  return {
    messages,
    total,
    queueHealth,
    failures,
    loading,
    error,
    refresh: fetchOutboxData,
    retryMessage,
    purgeProcessedMessages,
  };
}
