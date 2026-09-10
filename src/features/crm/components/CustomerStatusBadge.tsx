"use client";

import { CheckCircle2, ShieldAlert } from "lucide-react";

interface Props {
  creditHold: boolean;
}

export function CustomerStatusBadge({ creditHold }: Props) {
  if (creditHold) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-200">
        <ShieldAlert className="h-3.5 w-3.5" /> Credit Hold
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
      <CheckCircle2 className="h-3.5 w-3.5" /> Active Good Standing
    </span>
  );
}
