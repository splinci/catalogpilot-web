"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { useAIContent } from "@/features/ai/hooks/useAIContent";
import { AIContentTable } from "@/features/ai/components/AIContentTable";
import { AIContentApprovalDrawer } from "@/features/ai/components/AIContentApprovalDrawer";

export default function AIContentWorkspacePage() {
  const { loading, error, generatedContent, generateContent, approveContent } = useAIContent();
  const [productId, setProductId] = useState("SKU-ATL-001");
  const [tone, setTone] = useState<"PROFESSIONAL" | "CREATIVE" | "TECHNICAL" | "PROMOTIONAL">("PROFESSIONAL");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    try {
      await generateContent({
        productId,
        tone,
        includeSEO: true,
        featureBulletsCount: 5,
        language: "en",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const tableItems = generatedContent ? [generatedContent] : [
    {
      recommendationId: "rec_demo_01",
      productId: "SKU-ATL-001",
      title: "Splinci Enterprise Workstation Laptop Hub",
      description: "High-performance Thunderbolt 4 Quad-Display Workstation Docking Station built for enterprise environments.",
      seoTitle: "Splinci Enterprise Docking Workstation Hub",
      qualityScore: 94,
      confidenceScore: 0.96,
      approvalStatus: "AUTO_APPROVED",
    },
    {
      recommendationId: "rec_demo_02",
      productId: "SKU-ATL-002",
      title: "Splinci Commercial Micro-Controller Module",
      description: "Industrial grade IoT expansion unit designed for low-power edge computing.",
      seoTitle: "Splinci Industrial Edge Controller Unit",
      qualityScore: 82,
      confidenceScore: 0.88,
      approvalStatus: "PENDING_REVIEW",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHero
        title="AI Content Generation Studio"
        description="Generate commercial product titles, descriptions, SEO metadata, and feature bullet points with automated quality scoring."
        badge="AI Intelligence"
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Generator Form Card */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Generate New Catalog Content
        </h2>
        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Target Product ID / SKU</label>
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="e.g. SKU-ATL-001"
              required
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Generation Tone</label>
            <select
              value={tone}
              onChange={(e: any) => setTone(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-semibold"
            >
              <option value="PROFESSIONAL">Professional Enterprise</option>
              <option value="CREATIVE">Creative Promotional</option>
              <option value="TECHNICAL">Technical Specifications</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {loading ? "Generating..." : "Generate Content"}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Content Table */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          AI Catalog Recommendations
        </h2>
        <AIContentTable
          items={tableItems}
          loading={loading}
          onApprove={(id) => approveContent(id)}
          onRegenerate={(id) => generateContent({ productId: id, tone })}
          onViewDetails={(item) => {
            setSelectedItem(item);
            setIsDrawerOpen(true);
          }}
        />
      </div>

      <AIContentApprovalDrawer
        isOpen={isDrawerOpen}
        item={selectedItem}
        onClose={() => setIsDrawerOpen(false)}
        onApprove={(id) => approveContent(id)}
      />
    </div>
  );
}
