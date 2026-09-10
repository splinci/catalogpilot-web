/**
 * ============================================================================
 * Splinci Commerce OS — Reusable Operations State Components
 * ============================================================================
 * Specification Reference: M12-004 / UI-001
 * LoadingSkeleton, EmptyState, and ErrorState components for Operations
 * ============================================================================
 */

import React from "react";
import { AlertTriangle, Database, RefreshCw } from "lucide-react";

export function LoadingSkeleton({ title = "Loading Telemetry Data..." }: { title?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 rounded-xl border border-slate-800 animate-pulse space-y-4">
      <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
      <span className="text-slate-400 font-medium text-sm">{title}</span>
    </div>
  );
}

export function EmptyState({
  title = "No Operational Records Found",
  description = "There are no incidents or items matching your query criteria.",
  onRefresh,
}: {
  title?: string;
  description?: string;
  onRefresh?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-900/40 rounded-xl border border-slate-800 text-center space-y-3">
      <div className="p-3 bg-slate-800/60 rounded-full text-slate-400">
        <Database className="w-6 h-6" />
      </div>
      <h4 className="text-slate-200 font-semibold text-base">{title}</h4>
      <p className="text-slate-400 text-sm max-w-md">{description}</p>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  message = "An error occurred while fetching operational telemetry.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-red-950/30 rounded-xl border border-red-900/50 text-center space-y-3">
      <AlertTriangle className="w-8 h-8 text-red-400" />
      <h4 className="text-red-200 font-semibold text-sm">Telemetry Failure</h4>
      <p className="text-red-300/80 text-xs max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition"
        >
          Retry Fetch
        </button>
      )}
    </div>
  );
}
