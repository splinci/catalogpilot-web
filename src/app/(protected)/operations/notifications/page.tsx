"use client";

/**
 * ============================================================================
 * Splinci Commerce OS — Notification Center Workspace Page
 * ============================================================================
 * Specification Reference: M12-004 / UI-001
 * Operational Alert Notifications & User System Alert Center
 * ============================================================================
 */

import React, { useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Bell, RefreshCw, Filter } from "lucide-react";
import { useOperationsNotifications } from "@/features/operations/hooks/useOperationsNotifications";
import { NotificationCenter } from "@/features/operations/components/NotificationCenter";
import { LoadingSkeleton, ErrorState } from "@/features/operations/components/StateComponents";

export default function NotificationsPage() {
  const [filterRead, setFilterRead] = useState<boolean | undefined>(undefined);
  const { notifications, unreadCount, loading, error, refresh, markAsRead, markAllAsRead } = useOperationsNotifications(filterRead);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <PageHero title="Operational Notifications Center" description="System alerts, queue warnings & operational event notifications" />
        <LoadingSkeleton title="Loading Operational Notifications..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <PageHero title="Operational Notifications Center" description="System alerts, queue warnings & operational event notifications" />
        <ErrorState message={error} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHero
        title="Operational Notifications Center"
        description="System alerts, queue warnings & operational event notifications"
        actions={
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Notifications
          </button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-semibold">
          <Filter className="w-4 h-4" /> Filter:
        </div>
        <button
          onClick={() => setFilterRead(undefined)}
          className={`px-3 py-1 rounded-lg font-medium transition ${filterRead === undefined ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"}`}
        >
          All Notifications
        </button>
        <button
          onClick={() => setFilterRead(false)}
          className={`px-3 py-1 rounded-lg font-medium transition ${filterRead === false ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300"}`}
        >
          Unread Only ({unreadCount})
        </button>
        <button
          onClick={() => setFilterRead(true)}
          className={`px-3 py-1 rounded-lg font-medium transition ${filterRead === true ? "bg-slate-700 text-white" : "bg-slate-800 text-slate-300"}`}
        >
          Read History
        </button>
      </div>

      <NotificationCenter
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkRead={markAsRead}
        onMarkAllRead={markAllAsRead}
        onRefresh={refresh}
      />
    </div>
  );
}
