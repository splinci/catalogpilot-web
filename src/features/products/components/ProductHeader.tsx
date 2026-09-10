"use client";

import { useRouter } from "next/navigation";
import { Sparkles, Plus, Upload, Layers } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";

export function ProductHeader() {
  const router = useRouter();

  return (
    <div className="mb-6 space-y-4">
      <PageHero
        title="Product Information Management (PIM)"
        description="Manage your multi-channel product catalog, AI copywriting, brands, and categories."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => router.push("/bulk-import")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Upload className="h-4 w-4 text-purple-400" />
              <span>Bulk Import</span>
            </button>

            <button
              onClick={() => router.push("/bulk-generator")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Layers className="h-4 w-4 text-indigo-400" />
              <span>AI Generator</span>
            </button>

            <button
              onClick={() => router.push("/new-product")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>+ AI New Product</span>
            </button>
          </div>
        }
      />
    </div>
  );
}