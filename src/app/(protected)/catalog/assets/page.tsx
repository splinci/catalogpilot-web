"use client";

import { useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { FileText, Image as ImageIcon, Video, ShieldCheck, Download, Plus, FolderArchive } from "lucide-react";

interface Asset {
  id: string;
  name: string;
  type: "IMAGE" | "VIDEO" | "PDF_MANUAL" | "WARRANTY" | "DATASHEET";
  sku: string;
  size: string;
  uploadedAt: string;
  url: string;
}

export default function DigitalAssetManagementPage() {
  const [assets, setAssets] = useState<Asset[]>([]);

  return (
    <div className="space-y-8 font-sans">
      <PageHero
        title="Digital Asset Management (DAM) Studio"
        description="Central repository for high-resolution 4K product photography, MP4 video demonstrations, PDF technical manuals, safety datasheets, and warranty certificates."
        actions={
          <button
            onClick={() => alert("Uploading new asset to DAM repository...")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Upload Digital Asset</span>
          </button>
        }
      />

      {assets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-indigo-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                    {asset.type}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">{asset.size}</span>
                </div>

                <div className="h-28 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                  {asset.type === "IMAGE" && <ImageIcon className="h-10 w-10 text-indigo-400" />}
                  {asset.type === "VIDEO" && <Video className="h-10 w-10 text-purple-400" />}
                  {asset.type === "PDF_MANUAL" && <FileText className="h-10 w-10 text-rose-400" />}
                  {asset.type === "WARRANTY" && <ShieldCheck className="h-10 w-10 text-emerald-400" />}
                </div>

                <div>
                  <h3 className="font-bold text-slate-100 text-xs truncate group-hover:text-indigo-400 transition-colors">{asset.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">Linked SKU: {asset.sku}</p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] font-medium">{asset.uploadedAt}</span>
                <button
                  onClick={() => alert(`Downloading asset ${asset.name}...`)}
                  className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-12 text-center space-y-3">
          <FolderArchive className="h-10 w-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-200">No Digital Assets Available</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No digital assets uploaded for this tenant yet. Upload photography, manuals, or datasheets using the Upload button above.
          </p>
        </div>
      )}
    </div>
  );
}
