"use client";

/**
 * ============================================================================
 * Splinci Commerce OS — System Settings Workspace Page
 * ============================================================================
 * Specification Reference: M12-004 / UI-001
 * Operational Configuration & Protected System Settings Workspace
 * ============================================================================
 */

import React from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Settings, RefreshCw } from "lucide-react";
import { useSystemSettings } from "@/features/operations/hooks/useSystemSettings";
import { SystemSettingsTable } from "@/features/operations/components/SystemSettingsTable";
import { LoadingSkeleton, ErrorState } from "@/features/operations/components/StateComponents";

export default function SystemSettingsPage() {
  const { settings, loading, error, refresh, upsertSetting } = useSystemSettings();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <PageHero title="Operational System Settings" description="Tenant operational key-value configuration & system parameters" />
        <LoadingSkeleton title="Loading System Settings..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <PageHero title="Operational System Settings" description="Tenant operational key-value configuration & system parameters" />
        <ErrorState message={error} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHero
        title="Operational System Settings"
        description="Tenant operational key-value configuration & protected system parameters"
        actions={
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Settings
          </button>
        }
      />

      <SystemSettingsTable
        settings={settings}
        onSaveSetting={async (key, val) => {
          await upsertSetting(key, val);
        }}
        onRefresh={refresh}
      />
    </div>
  );
}
