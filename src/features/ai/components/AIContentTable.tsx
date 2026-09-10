"use client";

import React from "react";
import { AIQualityScore } from "./AIQualityScore";
import { AIConfidenceBadge } from "./AIConfidenceBadge";
import { Check, RefreshCw, Eye } from "lucide-react";

interface AIContentTableProps {
  items: any[];
  loading?: boolean;
  onApprove?: (id: string) => void;
  onRegenerate?: (productId: string) => void;
  onViewDetails?: (item: any) => void;
}

export const AIContentTable: React.FC<AIContentTableProps> = ({
  items,
  loading = false,
  onApprove,
  onRegenerate,
  onViewDetails,
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800 animate-pulse text-xs font-semibold">
        Loading generated content records...
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
        <h3 className="text-xs font-bold text-slate-300">No generated content available</h3>
        <p className="text-xs text-slate-400 mt-1">
          Generate catalog descriptions or SEO metadata to review recommendations here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-950/90 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
          <tr>
            <th className="px-6 py-3.5">Title / SKU</th>
            <th className="px-6 py-3.5">Quality &amp; Confidence</th>
            <th className="px-6 py-3.5">SEO Title</th>
            <th className="px-6 py-3.5">Approval Status</th>
            <th className="px-6 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {items.map((item, idx) => {
            const isApproved = item.approvalStatus === "AUTO_APPROVED" || item.status === "APPROVED";

            return (
              <tr key={item.recommendationId || item.id || idx} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-100">{item.title || "AI Generated Content"}</div>
                  <div className="text-xs text-purple-400 font-mono font-semibold mt-0.5">{item.productId || item.suggestedSku}</div>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <AIQualityScore score={item.qualityScore || 90} />
                  <AIConfidenceBadge confidence={item.confidenceScore || 0.94} />
                </td>
                <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate">
                  {item.seoTitle || "—"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                      isApproved
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    }`}
                  >
                    {isApproved ? "Approved" : "Pending Review"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(item)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  {onRegenerate && (
                    <button
                      onClick={() => onRegenerate(item.productId)}
                      className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 transition-colors cursor-pointer"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                  {!isApproved && onApprove && (
                    <button
                      onClick={() => onApprove(item.recommendationId || item.id)}
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs"
                      title="Approve & Apply"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
