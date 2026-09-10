"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import {
  CheckCircle2,
  ShieldCheck,
  Trash2,
  Sparkles,
  Plus,
  Boxes,
} from "lucide-react";

interface WorkspaceItem {
  id: string;
  sku: string;
  name: string;
  creationMethod: "MANUAL_SINGLE" | "MANUAL_BULK" | "AI_SINGLE" | "AI_BULK";
  qualityScore: number;
  aiConfidence?: number;
  status: "STAGED" | "NEEDS_REVIEW";
  price: number;
  selected: boolean;
}

export default function CatalogWorkspacePage() {
  const router = useRouter();
  const [workspaceItems, setWorkspaceItems] = useState<WorkspaceItem[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "DRAFTS" | "PENDING" | "APPROVED" | "REJECTED" | "PUBLISHED">("ALL");

  const toggleSelectAll = () => {
    const allSelected = workspaceItems.every((i) => i.selected);
    setWorkspaceItems((prev) => prev.map((i) => ({ ...i, selected: !allSelected })));
  };

  const toggleSelectItem = (id: string) => {
    setWorkspaceItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i))
    );
  };

  const handlePublishSelected = () => {
    const selectedCount = workspaceItems.filter((i) => i.selected).length;
    if (selectedCount === 0) {
      alert("Please select at least 1 item to publish!");
      return;
    }
    alert(`Successfully published ${selectedCount} product(s) to Live Catalog & synchronized downstream modules!`);
    router.push("/products");
  };

  const handleDeleteItem = (id: string) => {
    setWorkspaceItems((prev) => prev.filter((i) => i.id !== id));
  };

  const selectedCount = workspaceItems.filter((i) => i.selected).length;

  return (
    <div className="space-y-8 font-sans">
      <PageHero
        title="Catalog Studio"
        description="The quality gate and approval hub for Atlas PIM. Validate quality scores, audit AI confidence metrics, review drafts, and publish approved items into the master catalog."
        actions={
          <Link href="/catalog/create">
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
              <Plus className="h-4 w-4" />
              <span>+ Create More Products</span>
            </button>
          </Link>
        }
      />

      {/* Studio Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 text-xs font-bold">
        {[
          { id: "ALL", label: "All Items", count: workspaceItems.length },
          { id: "DRAFTS", label: "📁 Drafts", count: 0 },
          { id: "PENDING", label: "⏳ Pending Review", count: 0 },
          { id: "APPROVED", label: "✅ Approved", count: 0 },
          { id: "REJECTED", label: "❌ Rejected", count: 0 },
          { id: "PUBLISHED", label: "🚀 Published Queue", count: 0 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold shadow-md shadow-indigo-500/20 border border-indigo-500/30"
                : "bg-slate-900/60 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span>{tab.label}</span>
            <span className="rounded-full bg-slate-950 px-2 py-0.2 text-[10px] text-slate-300 border border-slate-800">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Batch Control Toolbar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSelectAll}
            disabled={workspaceItems.length === 0}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {workspaceItems.length > 0 && workspaceItems.every((i) => i.selected) ? "Deselect All" : "Select All"}
          </button>
          <span className="text-xs text-slate-400 font-medium">
            {selectedCount} of {workspaceItems.length} Staged Items Selected
          </span>
        </div>

        <button
          onClick={handlePublishSelected}
          disabled={selectedCount === 0}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-300" />
          <span>Approve &amp; Publish {selectedCount} Selected to Live Catalog</span>
        </button>
      </div>

      {/* Staging Items Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
        {workspaceItems.length > 0 ? (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/90 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4 w-10">Select</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Staged Product Title</th>
                <th className="px-6 py-4">Creation Method</th>
                <th className="px-6 py-4 text-center">Quality Score</th>
                <th className="px-6 py-4 text-center">AI Confidence</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {workspaceItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleSelectItem(item.id)}
                      className="h-4 w-4 rounded-md border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      {item.sku}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                    {item.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-mono font-bold text-slate-300 bg-slate-950 px-2.5 py-0.5 rounded-md border border-slate-800">
                      {item.creationMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-lg border ${
                        item.qualityScore >= 95
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" /> {item.qualityScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.aiConfidence ? (
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-extrabold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-lg border border-purple-500/20">
                        <Sparkles className="h-3 w-3 text-purple-400" /> {item.aiConfidence}%
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">N/A (Manual)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate-100">${item.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-all cursor-pointer shadow-xs"
                        title="Remove from Workspace"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center space-y-3 bg-slate-950/40">
            <Boxes className="h-10 w-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-200">Catalog Studio Staging Queue Empty</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No staged products currently awaiting review in Catalog Studio. Use Manual Entry or AI Ingestion to stage new products.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
