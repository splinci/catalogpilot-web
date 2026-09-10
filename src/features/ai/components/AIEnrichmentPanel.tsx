"use client";

import React, { useState } from "react";
import { Sparkles, Check, X, Layers } from "lucide-react";
import { AIQualityScore } from "./AIQualityScore";
import { AIConfidenceBadge } from "./AIConfidenceBadge";

interface AIEnrichmentPanelProps {
  onEnrich?: (productId: string) => Promise<any>;
  onApprove?: (enrichmentId: string) => Promise<any>;
  onReject?: (enrichmentId: string) => Promise<any>;
}

export const AIEnrichmentPanel: React.FC<AIEnrichmentPanelProps> = ({
  onEnrich,
  onApprove,
  onReject,
}) => {
  const [productId, setProductId] = useState("SKU-ATL-001");
  const [enrichment, setEnrichment] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleEnrich = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !onEnrich) return;
    setLoading(true);
    try {
      const data = await onEnrich(productId);
      setEnrichment(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            Catalog Enrichment Comparison Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare Original Values → AI Proposals → Approved Values side-by-side.
          </p>
        </div>
      </div>

      <form onSubmit={handleEnrich} className="flex gap-3">
        <input
          type="text"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="Enter Product SKU or ID..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? "Enriching..." : "Run Enrichment"}
          <Sparkles className="w-4 h-4 text-amber-300" />
        </button>
      </form>

      {enrichment && (
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-3">
              <AIQualityScore score={enrichment.qualityScore || 92} />
              <AIConfidenceBadge confidence={enrichment.confidenceScore || 0.94} />
            </div>
            <div className="flex items-center gap-2">
              {onReject && (
                <button
                  onClick={() => onReject(enrichment.enrichmentId)}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
              )}
              {onApprove && (
                <button
                  onClick={() => onApprove(enrichment.enrichmentId)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Approve &amp; Apply
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Original Values
              </span>
              <div className="space-y-2 text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Title</span>
                  <p className="font-bold text-slate-100">{enrichment.originalValues?.title}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Description</span>
                  <p className="text-xs text-slate-400">{enrichment.originalValues?.description}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> AI Proposal
              </span>
              <div className="space-y-2 text-slate-200">
                <div>
                  <span className="text-[10px] text-purple-400 block font-semibold">Enhanced Title</span>
                  <p className="font-bold text-purple-200">{enrichment.aiSuggestions?.title}</p>
                </div>
                <div>
                  <span className="text-[10px] text-purple-400 block font-semibold">Commercial Description</span>
                  <p className="text-xs text-slate-300">{enrichment.aiSuggestions?.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
