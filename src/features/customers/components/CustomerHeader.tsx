"use client";

import { useRouter } from "next/navigation";
import { Plus, Download, Users } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";

interface CustomerHeaderProps {
  onExport: () => void;
}

export function CustomerHeader({
  onExport,
}: CustomerHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-6">
      <PageHero
        title="Customer CRM & Accounts Directory"
        description="Manage B2B client accounts, retail customers, tax identification numbers, and contact profiles."
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={onExport}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => router.push("/customers/new")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>+ New Customer</span>
            </button>
          </div>
        }
      />
    </div>
  );
}