"use client";

import { FileSearch, AlertCircle, BarChart3, RefreshCw } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: "chart" | "search" | "alert";
  action?: { label: string; onClick: () => void };
}

export function EmptyState({
  title = "No data available",
  description = "There is no data to display for the selected period.",
  icon = "chart",
  action,
}: EmptyStateProps) {
  const icons = {
    chart: <BarChart3 className="h-12 w-12 text-slate-300" />,
    search: <FileSearch className="h-12 w-12 text-slate-300" />,
    alert: <AlertCircle className="h-12 w-12 text-slate-300" />,
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200">
        {icons[icon]}
      </div>
      <h3 className="text-base font-bold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-xs">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-600 transition-all cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          {action.label}
        </button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Something went wrong.", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200">
        <AlertCircle className="h-8 w-8 text-rose-400" />
      </div>
      <h3 className="text-sm font-bold text-rose-700 mb-1">Failed to load data</h3>
      <p className="text-xs text-slate-400 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      )}
    </div>
  );
}
