"use client";

import { ReactNode } from "react";

interface AdminDataTableProps {
  children: ReactNode;
}

export function AdminDataTable({
  children,
}: AdminDataTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {children}
    </div>
  );
}