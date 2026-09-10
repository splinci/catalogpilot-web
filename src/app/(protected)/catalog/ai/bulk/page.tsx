"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import {
  Sparkles,
  FileSpreadsheet,
  FileText,
  FolderArchive,
  Globe,
  Upload,
  CheckCircle2,
  ShieldCheck,
  Loader2,
} from "lucide-react";

interface AiItem {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  confidence: number;
  qualityScore: number;
  status: "READY";
}

export default function AiBulkProductPage() {
  const router = useRouter();
  const [fileUploaded, setFileUploaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [aiExtractedItems, setAiExtractedItems] = useState<AiItem[]>([]);

  const handleFileUpload = () => {
    setFileUploaded(true);
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
    }, 1200);
  };

  const handleStageAllToWorkspace = () => {
    alert("Extracted products successfully staged into Catalog Workspace!");
    router.push("/catalog/workspace");
  };

  return (
    <div className="space-y-8 font-sans">
      <PageHero
        title="AI Assisted Bulk Product Creation Studio"
        description="Upload multi-format supplier catalogs (Excel, Images, PDFs, CSV, ZIP, or Website URLs). Atlas AI autonomously parses products, fills missing spec fields, generates titles/descriptions, and stages listings for batch review."
      />

      {/* Multi-Format File Dropzone */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 mx-auto">
            <Sparkles className="h-7 w-7 text-amber-300 animate-pulse" />
          </div>
          <h3 className="text-xl font-extrabold text-white">Upload Bulk Supplier Files or Catalogs</h3>
          <p className="text-xs text-slate-400">
            Accepts Excel (.xlsx), PDF catalogs, ZIP image archives, CSV feeds, or website scraping lists
          </p>
        </div>

        {/* Accepted Formats Chips */}
        <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950 px-3 py-1 shadow-xs">
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" /> Excel / CSV
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950 px-3 py-1 shadow-xs">
            <FileText className="h-3.5 w-3.5 text-rose-400" /> PDF Catalog
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950 px-3 py-1 shadow-xs">
            <FolderArchive className="h-3.5 w-3.5 text-amber-400" /> ZIP Image Bundle
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950 px-3 py-1 shadow-xs">
            <Globe className="h-3.5 w-3.5 text-indigo-400" /> Web URLs
          </span>
        </div>

        {/* Uploader Box */}
        <div
          onClick={handleFileUpload}
          className="border-2 border-dashed border-purple-500/40 rounded-2xl p-10 bg-slate-950/60 hover:bg-purple-500/10 cursor-pointer transition-all text-center space-y-3 shadow-xl"
        >
          <Upload className="h-8 w-8 text-purple-400 mx-auto" />
          <div>
            <span className="text-sm font-black text-white">Click or Drag &amp; Drop Supplier Catalog</span>
            <p className="text-xs text-slate-400 mt-1">Upload 50 to 5,000 products in one autonomous batch</p>
          </div>
        </div>
      </div>

      {/* Processing Animation */}
      {processing && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center space-y-3 shadow-xl">
          <Loader2 className="h-8 w-8 text-purple-400 animate-spin mx-auto" />
          <h3 className="text-lg font-extrabold text-white">Splinci AI Multi-Product Pipeline Running...</h3>
          <p className="text-xs text-slate-400">Extracting Specs • Generating Descriptions • Suggesting Categories • Scoring Confidence</p>
        </div>
      )}

      {/* Extracted AI Products Batch Grid */}
      {fileUploaded && !processing && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-md border border-purple-500/20">
                AI Autonomous Batch Output
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                {aiExtractedItems.length} Products Successfully Extracted &amp; Enriched
              </h3>
            </div>

            <button
              onClick={handleStageAllToWorkspace}
              disabled={aiExtractedItems.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <span>Stage Products to Workspace</span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden p-8 text-center text-xs text-slate-400">
            No products extracted in current upload session.
          </div>
        </div>
      )}
    </div>
  );
}
