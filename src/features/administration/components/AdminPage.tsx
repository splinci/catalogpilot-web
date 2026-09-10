"use client";

import { PageHero } from "@/components/layout/PageHero";

interface AdminPageProps {
  title: string;
  description?: string;

  toolbar?: React.ReactNode;

  children: React.ReactNode;
}

export function AdminPage({
  title,
  description,
  toolbar,
  children,
}: AdminPageProps) {
  return (
    <div className="space-y-6">
      <PageHero
        title={title}
        description={description}
      />

      {toolbar && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          {toolbar}
        </div>
      )}

      <div>
        {children}
      </div>
    </div>
  );
}