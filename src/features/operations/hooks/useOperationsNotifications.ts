/**
 * ============================================================================
 * Splinci Commerce OS — useOperationsNotifications Hook
 * ============================================================================
 * Specification Reference: M12-004 / API-001 / UI-001
 * Consumes: /api/operations/notifications, /api/operations/notifications/[id]/read,
 *           /api/operations/notifications/read-all, /api/operations/notifications/unread-count
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";

export function useOperationsNotifications(isReadFilter?: boolean) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotificationsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (isReadFilter !== undefined) queryParams.set("isRead", isReadFilter.toString());

      const [listRes, countRes] = await Promise.all([
        fetch(`/api/operations/notifications?${queryParams.toString()}`),
        fetch("/api/operations/notifications/unread-count"),
      ]);

      const [listJson, countJson] = await Promise.all([
        listRes.json(),
        countRes.json(),
      ]);

      if (listJson.success) setNotifications(listJson.data || []);
      if (countJson.success) setUnreadCount(countJson.data?.unreadCount || 0);
    } catch (err: any) {
      setError(err?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [isReadFilter]);

  const createNotification = async (title: string, message: string, userId?: string) => {
    try {
      const res = await fetch("/api/operations/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, userId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create notification");
      }
      await fetchNotificationsData();
      return json.data;
    } catch (err: any) {
      throw new Error(err.message || "Failed to create notification");
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/operations/notifications/${id}/read`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to mark notification read");
      }
      await fetchNotificationsData();
      return json.data;
    } catch (err: any) {
      throw new Error(err.message || "Failed to mark notification read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/operations/notifications/read-all", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to mark all read");
      }
      await fetchNotificationsData();
      return json.data;
    } catch (err: any) {
      throw new Error(err.message || "Failed to mark all read");
    }
  };

  useEffect(() => {
    fetchNotificationsData();
  }, [fetchNotificationsData]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: fetchNotificationsData,
    createNotification,
    markAsRead,
    markAllAsRead,
  };
}
