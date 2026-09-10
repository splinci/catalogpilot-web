/**
 * ============================================================================
 * Splinci Commerce OS — NotificationCenter Component
 * ============================================================================
 * Specification Reference: M12-004 / UI-001
 * Displays operational alert notifications center with mark read actions
 * ============================================================================
 */

import React from "react";
import { Bell, CheckCheck, CheckCircle, AlertTriangle } from "lucide-react";

export function NotificationCenter({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onRefresh,
}: {
  notifications: any[];
  unreadCount: number;
  onMarkRead: (id: string) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
  onRefresh?: () => void;
}) {
  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-600 text-white rounded-full text-[9px] font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-slate-100 font-semibold text-base">Operational Alert Notifications</h3>
            <p className="text-slate-400 text-xs">{unreadCount} unread system notifications</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> Mark All Read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs">
            No system notifications present.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 rounded-lg border flex items-start justify-between gap-3 text-xs transition ${
                n.isRead
                  ? "bg-slate-900/40 border-slate-800/80 text-slate-400"
                  : "bg-slate-800/70 border-indigo-950/60 text-slate-200"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-100 text-sm">{n.title}</span>
                  {!n.isRead && (
                    <span className="px-2 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-800 rounded-full text-[9px] font-bold">
                      UNREAD
                    </span>
                  )}
                </div>
                <p className="text-slate-300 text-xs">{n.message}</p>
                <div className="text-slate-500 text-[10px]">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => onMarkRead(n.id)}
                  className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition shrink-0"
                  title="Mark as read"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
