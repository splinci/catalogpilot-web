"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { FileCode, Download, Plus, CheckCircle2, ShieldCheck } from "lucide-react";

interface MappingTemplate {
  id: string;
  name: string;
  targetPlatform: string;
  fieldCount: number;
  lastUsed: string;
}

export default function CatalogTemplatesPage() {
  const [templates, setTemplates] = useState<MappingTemplate[]>([
    {
      id: "TPL-01",
      name: "Amazon Flat File Listing Preset",
      targetPlatform: "Amazon Seller Central",
      fieldCount: 24,
      lastUsed: "2 hours ago",
    },
    {
      id: "TPL-02",
      name: "Shopify CSV Catalog Importer",
      targetPlatform: "Shopify Storefront",
      fieldCount: 18,
      lastUsed: "Yesterday",
    },
    {
      id: "TPL-03",
      name: "Walmart Marketplace Spec Sheet",
      targetPlatform: "Walmart Seller Center",
      fieldCount: 30,
      lastUsed: "3 days ago",
    },
    {
      id: "TPL-04",
      name: "Custom Supplier Excel Matrix",
      targetPlatform: "Atlas ERP Internal",
      fieldCount: 15,
      lastUsed: "Jul 28, 2026",
    },
  ]);

  return (
    <div className="space-y-8">
      <PageHero
        title="Saved Bulk Mapping Templates"
        description="Pre-configured column mapping presets for Amazon, Walmart, Shopify, and custom supplier feeds. Save time by re-using standard bulk template mappings."
        actions={
          <button
            onClick={() => alert("Creating new template preset...")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>+ Create Custom Template</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-indigo-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                  {tpl.id}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">{tpl.lastUsed}</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">{tpl.name}</h3>
              <p className="text-xs text-slate-500 font-medium">{tpl.targetPlatform}</p>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-600">{tpl.fieldCount} Mapped Fields</span>
              <button
                onClick={() => alert(`Downloading template ${tpl.name}...`)}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-bold"
              >
                <Download className="h-3.5 w-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
