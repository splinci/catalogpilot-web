"use client";

import { useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { History, RotateCcw, CheckCircle2, Eye } from "lucide-react";

interface VersionRecord {
  version: string;
  timestamp: string;
  author: string;
  sku: string;
  productName: string;
  changesSummary: string;
  status: "CURRENT" | "HISTORICAL";
}

export default function ProductVersioningPage() {
  const [selectedSku, setSelectedSku] = useState("");
  const [versions, setVersions] = useState<VersionRecord[]>([]);

  const handleRollback = (ver: string) => {
    alert(`Initiating 1-click restore to Product Version ${ver} for SKU ${selectedSku}...`);
  };

  return (
    <div className="space-y-8 font-sans">
      <PageHero
        title="Product Versioning &amp; Visual Rollback Hub"
        description="Audit version evolution graph, perform side-by-side diff comparison between historical snapshots, and restore prior product states with 1-click rollback."
      />

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-indigo-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              {selectedSku || "No SKU Selected"}
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-2">
              Product Version History Tree
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" /> Active Version v1.0
          </span>
        </div>

        {/* Version Timeline Cards */}
        {versions.length > 0 ? (
          <div className="space-y-4">
            {versions.map((ver) => (
              <div
                key={ver.version}
                className={`rounded-2xl border p-5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  ver.status === "CURRENT"
                    ? "border-indigo-300 bg-indigo-50/20 shadow-xs"
                    : "border-slate-200/80 bg-white hover:border-slate-300"
                }`}
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                      {ver.version}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{ver.timestamp}</span>
                    <span className="text-xs font-semibold text-slate-600">by {ver.author}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">{ver.changesSummary}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => alert(`Opening side-by-side diff for ${ver.version}...`)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-500" /> View Diff
                  </button>

                  {ver.status !== "CURRENT" && (
                    <button
                      onClick={() => handleRollback(ver.version)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-600 transition-all cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Restore {ver.version}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3 bg-slate-50 rounded-xl border border-slate-100">
            <History className="h-10 w-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">No Product Version Logs Available</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No product revisions logged for this tenant yet. Version history is automatically captured when catalog items are edited or published.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
