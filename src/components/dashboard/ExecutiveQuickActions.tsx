"use client";

import Link from "next/link";
import { Sparkles, FileText, ShoppingCart, Upload, Plus } from "lucide-react";

export default function ExecutiveQuickActions() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Executive Actions
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/new-product"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>AI New Product</span>
          </Link>

          <Link
            href="/purchasing"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all"
          >
            <FileText className="h-3.5 w-3.5 text-indigo-600" />
            <span>New Purchase Order</span>
          </Link>

          <Link
            href="/orders/new"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all"
          >
            <ShoppingCart className="h-3.5 w-3.5 text-emerald-600" />
            <span>New Sales Order</span>
          </Link>

          <Link
            href="/bulk-import"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all"
          >
            <Upload className="h-3.5 w-3.5 text-purple-600" />
            <span>Import Catalog</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
