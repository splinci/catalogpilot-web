"use client";

import React from "react";
import { X, Check, Award, Sparkles } from "lucide-react";
import { AIQualityScore } from "./AIQualityScore";
import { AIConfidenceBadge } from "./AIConfidenceBadge";

interface AIContentApprovalDrawerProps {
  isOpen: boolean;
  item: any;
  onClose: () => void;
  onApprove: (id: string) => Promise<any>;
}

export const AIContentApprovalDrawer: React.FC<AIContentApprovalDrawerProps> = ({
  isOpen,
  item,
  onClose,
  onApprove,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI Content Proposal Review
              </h2>
              <span className="text-xs font-mono text-purple-400 mt-1 block">
                SKU: {item.productId || item.suggestedSku}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <AIQualityScore score={item.qualityScore || 90} />
            <AIConfidenceBadge confidence={item.confidenceScore || 0.94} />
          </div>

          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                Generated Title
              </span>
              <p className="font-semibold text-white">{item.title || "AI Generated Title"}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                Commercial Description
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.description || "High performance enterprise hardware with complete warranty."}
              </p>
            </div>

            {item.seoTitle && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider block">
                  SEO Metadata
                </span>
                <div>
                  <span className="text-xs text-slate-500 block">SEO Title</span>
                  <p className="text-xs font-medium text-slate-200">{item.seoTitle}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">SEO Description</span>
                  <p className="text-xs text-slate-400">{item.seoDescription}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
          >
            Close
          </button>
          <button
            onClick={async () => {
              await onApprove(item.recommendationId || item.id);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Approve & Sync to Catalog
          </button>
        </div>
      </div>
    </div>
  );
};
