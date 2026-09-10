"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import {
  Sparkles,
  Camera,
  FileText,
  Globe,
  Edit3,
  CheckCircle2,
  Lightbulb,
  ShieldCheck,
  Loader2,
  FileCode,
  Upload,
} from "lucide-react";

export default function AiSingleProductPage() {
  const router = useRouter();
  const [inputMode, setInputMode] = useState<"images" | "pdf" | "datasheet" | "url" | "text">("images");

  // Form input states
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // AI Generated Output State with Confidence Badges
  const [aiOutput, setAiOutput] = useState({
    title: "",
    titleConfidence: 0,
    sku: "",
    skuConfidence: 0,
    category: "",
    categoryConfidence: 0,
    brand: "",
    brandConfidence: 0,
    description: "",
    descriptionConfidence: 0,
    attributes: [] as { key: string; value: string; confidence: number }[],
    seoKeywords: "",
    metaTitle: "",
    metaDescription: "",
  });

  const handleRunAiGeneration = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setAiOutput({
        title: textInput || "Extracted Product Title",
        titleConfidence: 95,
        sku: `SKU-AI-${Date.now().toString().slice(-4)}`,
        skuConfidence: 90,
        category: "General Category",
        categoryConfidence: 88,
        brand: "Extracted Brand",
        brandConfidence: 85,
        description: "AI Generated Description based on provided source input.",
        descriptionConfidence: 92,
        attributes: [
          { key: "Extraction Source", value: inputMode.toUpperCase(), confidence: 99 },
        ],
        seoKeywords: "",
        metaTitle: "",
        metaDescription: "",
      });
      setHasGenerated(true);
    }, 1200);
  };

  const handleStageToWorkspace = () => {
    alert("AI Generated Product successfully staged to Catalog Workspace!");
    router.push("/catalog/workspace");
  };

  return (
    <div className="space-y-8 font-sans">
      <PageHero
        title="AI Assisted Single Product Studio"
        description="Select a source input method (Images, PDF, Datasheet, URL, or Text Description). Atlas AI autonomously extracts product specs, calculates field confidence scores, and builds high-converting listings."
      />

      {/* Input Mode Selector */}
      <div className="rounded-3xl border border-purple-900/30 bg-gradient-to-r from-slate-900 to-slate-900 p-6 shadow-xl space-y-6">
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>How would you like to create the product?</span>
          </h3>
          <p className="text-xs text-slate-400">5 Source Inputs (Images, PDF, Datasheet, URL, Describe) &rarr; AI Confidence Badges & Review Grid.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { id: "images", label: "Upload Images", icon: Camera },
            { id: "pdf", label: "Upload PDF", icon: FileText },
            { id: "datasheet", label: "Upload Datasheet", icon: FileCode },
            { id: "url", label: "Enter Website URL", icon: Globe },
            { id: "text", label: "Describe Product", icon: Edit3 },
          ].map((mode) => {
            const Icon = mode.icon;
            const active = inputMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setInputMode(mode.id as any)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? "border-purple-500 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 scale-[1.02]"
                    : "border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 mb-1.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Controls */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-4">
          {inputMode === "url" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Enter Supplier Product Page URL</label>
              <input
                type="url"
                placeholder="https://supplier.com/products/item"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          )}

          {inputMode === "text" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Product Notes or Unstructured Specs</label>
              <textarea
                rows={3}
                placeholder="Enter product title, specs, features, or notes for AI parsing..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          )}

          {(inputMode === "images" || inputMode === "pdf" || inputMode === "datasheet") && (
            <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 bg-slate-950/60 text-center space-y-2 hover:border-purple-500/50 transition-colors cursor-pointer">
              <Upload className="h-6 w-6 text-purple-400 mx-auto" />
              <p className="text-xs font-bold text-slate-200">Drop files or click to upload target source for AI analysis</p>
            </div>
          )}

          <button
            onClick={handleRunAiGeneration}
            disabled={generating}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 py-3 text-xs font-bold text-white shadow-lg shadow-purple-500/25 hover:from-purple-500 hover:to-indigo-500 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Running Splinci AI Multi-Model Extraction Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Run Splinci AI Product Generator</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Extraction Output Grid */}
      {hasGenerated && (
        <div className="space-y-6 pt-4 border-t border-slate-800">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-md border border-purple-500/20">
                Splinci AI Output Review
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                Product Specs &amp; Listing Generated
              </h3>
              <p className="text-xs text-slate-400">Review AI proposals, edit fields, and approve to stage directly into catalog workspace.</p>
            </div>

            <button
              onClick={handleStageToWorkspace}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <span>Approve &amp; Stage to Workspace</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Generated Attributes & Fields */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Generated Product Title</label>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      Confidence: {aiOutput.titleConfidence}%
                    </span>
                  </div>
                  <input
                    type="text"
                    value={aiOutput.title}
                    onChange={(e) => setAiOutput({ ...aiOutput, title: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs font-bold text-slate-100 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* Category & Brand */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Category Suggestion</label>
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        {aiOutput.categoryConfidence}%
                      </span>
                    </div>
                    <input
                      type="text"
                      value={aiOutput.category}
                      onChange={(e) => setAiOutput({ ...aiOutput, category: e.target.value })}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs font-semibold text-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Brand Suggestion</label>
                      <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                        {aiOutput.brandConfidence}%
                      </span>
                    </div>
                    <input
                      type="text"
                      value={aiOutput.brand}
                      onChange={(e) => setAiOutput({ ...aiOutput, brand: e.target.value })}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs font-semibold text-slate-200"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">AI Description</label>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      {aiOutput.descriptionConfidence}%
                    </span>
                  </div>
                  <textarea
                    value={aiOutput.description}
                    onChange={(e) => setAiOutput({ ...aiOutput, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs leading-relaxed text-slate-300 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* Master Attributes */}
                <div className="space-y-2 pt-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Extracted Specifications &amp; Attributes</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {aiOutput.attributes.map((attr, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{attr.key}</div>
                        <div className="text-xs font-extrabold text-slate-100">{attr.value}</div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">Confidence {attr.confidence}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Suggestions Panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
                <h4 className="text-xs font-black text-slate-100 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  <span>AI Optimization Suggestions</span>
                </h4>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <div className="font-bold text-purple-400 flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                      <span>Attribute Quality Extraction</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Product features processed through AI extraction pipeline.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
