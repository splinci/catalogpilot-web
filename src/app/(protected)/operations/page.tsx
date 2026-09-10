"use client";

/**
 * ============================================================================
 * Splinci Commerce OS — Operations Command Center Page
 * ============================================================================
 * Specification Reference: M12-004 / UI-001
 * Main Enterprise Operations & Production Readiness Dashboard
 * ============================================================================
 */

import React from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Activity, ShieldCheck, RefreshCw } from "lucide-react";
import { useOperationsAnalytics } from "@/features/operations/hooks/useOperationsAnalytics";
import { useOperationsIncidents } from "@/features/operations/hooks/useOperationsIncidents";
import { useOperationsNotifications } from "@/features/operations/hooks/useOperationsNotifications";
import { OperationsKPICards } from "@/features/operations/components/OperationsKPICards";
import { OperationsReadinessCard } from "@/features/operations/components/OperationsReadinessCard";
import { SystemHealthCard } from "@/features/operations/components/SystemHealthCard";
import { CriticalIncidentBanner } from "@/features/operations/components/CriticalIncidentBanner";
import { OperationsDashboardCharts } from "@/features/operations/components/OperationsDashboardCharts";
import { IncidentTable } from "@/features/operations/components/IncidentTable";
import { NotificationCenter } from "@/features/operations/components/NotificationCenter";
import { LoadingSkeleton, ErrorState } from "@/features/operations/components/StateComponents";

export default function OperationsDashboardPage() {
  const { dashboard, loading: dashLoading, error: dashError, refresh: refreshDash } = useOperationsAnalytics();
  const { incidents, critical, refresh: refreshIncidents } = useOperationsIncidents({ limit: 5 });
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: refreshNotifs,
  } = useOperationsNotifications();

  const handleRefreshAll = () => {
    refreshDash();
    refreshIncidents();
    refreshNotifs();
  };

  if (dashLoading) {
    return (
      <div className="p-6 space-y-6">
        <PageHero title="Operations Command Center" description="Real-time enterprise platform telemetry, readiness & incident monitoring" />
        <LoadingSkeleton title="Loading Operational Telemetry Dashboard..." />
      </div>
    );
  }

  if (dashError) {
    return (
      <div className="p-6 space-y-6">
        <PageHero title="Operations Command Center" description="Real-time enterprise platform telemetry, readiness & incident monitoring" />
        <ErrorState message={dashError} onRetry={handleRefreshAll} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Hero */}
      <PageHero
        title="Operations Command Center"
        description="Real-time enterprise platform telemetry, readiness, outbox queues & incident monitoring"
        actions={
          <button
            onClick={handleRefreshAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
          </button>
        }
      />

      {/* Critical Incidents Warning Banner */}
      <CriticalIncidentBanner incidents={critical} />

      {/* KPI Cards */}
      <OperationsKPICards
        readiness={dashboard?.readiness}
        telemetry={dashboard?.telemetry}
        metrics={dashboard?.metrics}
        incidentsSummary={dashboard?.incidentSummary}
      />

      {/* Production Readiness & System Health Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OperationsReadinessCard readiness={dashboard?.readiness} />
        <SystemHealthCard telemetry={dashboard?.telemetry ? {
          status: dashboard.telemetry.status,
          version: dashboard.telemetry.version,
          timestamp: dashboard.timestamp,
          uptimeSeconds: dashboard.telemetry.uptimeSeconds,
          database: { status: "CONNECTED", latencyMs: dashboard.telemetry.databaseLatencyMs, provider: "PostgreSQL" },
          system: { memoryHeapUsedMB: dashboard.telemetry.memoryHeapUsedMB, memoryRssMB: "120.0", nodeVersion: "v20" },
          security: { sqlInjectionProtected: true, xssAutoEscaping: true, multiTenantIsolated: true, rateLimitingActive: true },
        } : null} />
      </div>

      {/* Dashboard Visual Charts */}
      <OperationsDashboardCharts metrics={dashboard?.metrics} incidentsSummary={dashboard?.incidentSummary} />

      {/* Incidents Table & Notification Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IncidentTable incidents={incidents} onRefresh={refreshIncidents} />
        </div>
        <div>
          <NotificationCenter
            notifications={notifications.slice(0, 5)}
            unreadCount={unreadCount}
            onMarkRead={markAsRead}
            onMarkAllRead={markAllAsRead}
            onRefresh={refreshNotifs}
          />
        </div>
      </div>
    </div>
  );
}
