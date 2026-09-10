"use client";

import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import {
  PackagePlus,
  Sparkles,
  FileSpreadsheet,
  Cpu,
  ArrowRight,
  Boxes,
  History,
  FileCode,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function CatalogCreateHubPage() {
  return (
    <div className="space-y-8">
      {/* Page Hero */}
      <PageHero
        title="Atlas Catalog Creation Hub"
        description="Select your preferred creation workflow. Build products manually with precision tools or leverage AI Assisted generation across single and bulk formats."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/catalog/workspace"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-200 border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              <Boxes className="h-4 w-4 text-indigo-400" />
              <span>Catalog Workspace</span>
            </Link>
            <Link
              href="/catalog/history"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-200 border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              <History className="h-4 w-4 text-purple-400" />
              <span>Creation History</span>
            </Link>
          </div>
        }
      />

      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Catalog Workspace</div>
            <div className="text-xl font-black text-slate-900">0 Staged Items</div>
            <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="h-3 w-3" /> Ready for team review & publish
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 font-bold">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Quality Score Engine</div>
            <div className="text-xl font-black text-slate-900">98% Avg Score</div>
            <div className="text-[11px] text-purple-600 font-bold flex items-center gap-1 mt-0.5">
              Confidence badging per attribute
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saved Templates</div>
            <div className="text-xl font-black text-slate-900">4 Active Presets</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              Amazon, Walmart, Shopify, Custom
            </div>
          </div>
        </div>
      </div>

      {/* Creation Method Selection Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Choose Creation Method</h2>
            <p className="text-xs text-slate-500 font-medium">Select your starting workflow mode</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Method 1: Manual Creation */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md transition-all space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-50 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-100 transition-colors" />

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                <PackagePlus className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                  Method ①
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">Manual Creation</h3>
                <p className="text-xs text-slate-500">Step-by-step custom form entry & structured bulk spreadsheets</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Single Manual */}
              <Link
                href="/catalog/manual/single"
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-white hover:border-indigo-300 hover:shadow-xs transition-all space-y-3 block group/card"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs">
                    1.1
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover/card:text-indigo-600 group-hover/card:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 group-hover/card:text-indigo-600 transition-colors">
                    Single Product Creation
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Auto-SKU generation, barcode badges, drafts, gross margin calculator & master attributes.
                  </p>
                </div>
              </Link>

              {/* Bulk Manual */}
              <Link
                href="/catalog/manual/bulk"
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-white hover:border-indigo-300 hover:shadow-xs transition-all space-y-3 block group/card"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs">
                    1.2
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover/card:text-indigo-600 group-hover/card:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 group-hover/card:text-indigo-600 transition-colors">
                    Bulk Product Creation
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    6-step pipeline with Excel/CSV download, multi-rule validation & error scoring grid.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Method 2: AI Assisted Creation */}
          <div className="rounded-3xl border border-purple-200/80 bg-gradient-to-br from-white via-purple-50/20 to-indigo-50/30 p-6 shadow-xs hover:shadow-md transition-all space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-32 w-32 bg-purple-100/60 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-200/80 transition-colors" />

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30">
                <Sparkles className="h-6 w-6 text-amber-300 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold text-purple-700 uppercase tracking-wider bg-purple-100 px-2.5 py-0.5 rounded-md border border-purple-200">
                  Method ②
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">AI Assisted Creation</h3>
                <p className="text-xs text-slate-500">Autonomous data extraction from files, PDFs, URLs & images with review controls</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Single AI */}
              <Link
                href="/catalog/ai/single"
                className="rounded-2xl border border-purple-200/80 bg-white/90 p-4 hover:bg-white hover:border-purple-400 hover:shadow-xs transition-all space-y-3 block group/card"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold text-xs">
                    2.1
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover/card:text-purple-600 group-hover/card:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 group-hover/card:text-purple-600 transition-colors">
                    AI Single Product Creation
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    5 Source Inputs (Images, PDF, Datasheet, URL, Describe) &rarr; AI Confidence Badges & Review Grid.
                  </p>
                </div>
              </Link>

              {/* Bulk AI */}
              <Link
                href="/catalog/ai/bulk"
                className="rounded-2xl border border-purple-200/80 bg-white/90 p-4 hover:bg-white hover:border-purple-400 hover:shadow-xs transition-all space-y-3 block group/card"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold text-xs">
                    2.2
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover/card:text-purple-600 group-hover/card:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 group-hover/card:text-purple-600 transition-colors">
                    AI Bulk Product Creation
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload Supplier Catalogs, ZIP, PDFs & URLs &rarr; Autonomous multi-product extraction & staging.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
