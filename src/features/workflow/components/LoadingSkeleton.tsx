"use client";

import React from "react";

interface LoadingSkeletonProps {
  rows?: number;
  height?: string;
  className?: string;
}

export function LoadingSkeleton({ rows = 4, height = "h-12", className = "" }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`${height} bg-slate-800/60 border border-slate-700/50 rounded-xl w-full`}
        />
      ))}
    </div>
  );
}
