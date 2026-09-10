"use client";

import React from "react";

interface WorkflowStatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export function WorkflowStatusBadge({ status, size = "md" }: WorkflowStatusBadgeProps) {
  const normalized = (status || "").toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case "ACTIVE":
      case "COMPLETED":
      case "APPROVED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "RUNNING":
      case "PENDING":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse";
      case "DRAFT":
      case "INACTIVE":
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
      case "REJECTED":
      case "FAILED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "EXPIRED":
      case "CANCELLED":
      case "ARCHIVED":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "SKIPPED":
        return "bg-sky-500/10 text-sky-400 border-sky-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  const pad = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center font-bold tracking-wider rounded-md border uppercase transition-all ${pad} ${getStyle()}`}
    >
      {normalized}
    </span>
  );
}
