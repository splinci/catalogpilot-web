"use client";

/**
 * LoadingSkeleton — reusable animated skeleton for loading states
 */

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function LoadingSkeleton({ className = "", lines }: SkeletonProps) {
  if (lines) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-4 rounded-lg bg-slate-200/80 animate-pulse" style={{ width: `${85 - i * 10}%` }} />
        ))}
      </div>
    );
  }
  return <div className={`rounded-2xl bg-slate-200/60 animate-pulse ${className}`} />;
}

export function KPICardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-slate-200" />
        <div className="h-5 w-16 rounded-lg bg-slate-200" />
      </div>
      <div className="h-8 w-24 rounded-lg bg-slate-200 mb-2" />
      <div className="h-4 w-32 rounded-md bg-slate-100" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <div className="h-14 border-b border-slate-100 bg-slate-50 animate-pulse" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-5 py-3.5 border-b border-slate-50">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 flex-1 rounded-md bg-slate-100 animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white shadow-xs ${height} animate-pulse`}>
      <div className="h-14 border-b border-slate-100 bg-slate-50" />
      <div className="p-5 flex items-end gap-2 h-full">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 rounded-t-lg bg-slate-100" style={{ height: `${30 + Math.random() * 60}%` }} />
        ))}
      </div>
    </div>
  );
}
