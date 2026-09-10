"use client";

import React, { useState } from "react";
import { Sparkles, Tag, Layers, ShieldCheck, ArrowRight } from "lucide-react";
import { AIConfidenceBadge } from "./AIConfidenceBadge";

interface AIClassificationPanelProps {
  onClassify?: (productId: string) => Promise<any>;
}

export const AIClassificationPanel: React.FC<AIClassificationPanelProps> = ({ onClassify }) => {
  const [productId, setProductId] = useState("prod_sample_123");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleClassify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !onClassify) return;
    setLoading(true);
    try {
      const data = await onClassify(productId);
      setResult(data);
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
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Catalog Classification Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Predict category hierarchy, brand metadata, and attribute schemas.
          </p>
        </div>
      </div>

      <form onSubmit={handleClassify} className="flex gap-3">
        <input
          type="text"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="Enter Product ID or SKU..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? "Classifying..." : "Run Classification"}
          <ArrowRight className="w-4 h-4 text-amber-300" />
        </button>
      </form>

      {result && (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase">
                  <Layers className="w-3.5 h-3.5 text-purple-400" /> Predicted Category
                </span>
                <AIConfidenceBadge confidence={result.categoryPrediction?.confidenceScore || 0.94} />
              </div>
              <div className="text-base font-black text-slate-100">
                {result.categoryPrediction?.categoryName || "Electronics & Hardware"}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Predicted Brand
                </span>
                <AIConfidenceBadge confidence={result.brandPrediction?.confidenceScore || 0.91} />
              </div>
              <div className="text-base font-black text-slate-100">
                {result.brandPrediction?.brandName || "Splinci Hardware"}
              </div>
            </div>
          </div>

          {result.attributePredictions && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 block">
                Extracted Attributes &amp; Values
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {result.attributePredictions.map((attr: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-semibold">{attr.fieldName}</div>
                    <div className="text-xs font-bold text-purple-300 mt-0.5">
                      {attr.suggestedValue}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.predictedTags && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" />
              <div className="flex flex-wrap gap-1.5">
                {result.predictedTags.map((tagObj: any, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold"
                  >
                    #{tagObj.tag || tagObj}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
