"use client";

import { ReactNode } from "react";

interface AdminSectionProps {
  title: string;
  children: ReactNode;
}

export function AdminSection({
  title,
  children,
}: AdminSectionProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
      </div>

      <div className="p-6">
        {children}
      </div>
    </section>
  );
}