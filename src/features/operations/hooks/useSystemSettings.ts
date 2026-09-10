/**
 * ============================================================================
 * Splinci Commerce OS — useSystemSettings Hook
 * ============================================================================
 * Specification Reference: M12-004 / API-001 / UI-001
 * Consumes: /api/operations/settings, /api/operations/settings/[key]
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";

export function useSystemSettings() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/operations/settings");
      const json = await res.json();
      if (json.success) {
        setSettings(json.data || []);
      } else {
        throw new Error(json.error || "Failed to load system settings");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load system settings");
    } finally {
      setLoading(false);
    }
  }, []);

  const upsertSetting = async (key: string, value: string) => {
    try {
      const res = await fetch("/api/operations/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update setting");
      }
      await fetchSettings();
      return json.data;
    } catch (err: any) {
      throw new Error(err.message || "Failed to update setting");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    refresh: fetchSettings,
    upsertSetting,
  };
}
