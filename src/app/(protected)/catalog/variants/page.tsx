"use client";

import { useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Plus, CheckCircle2, Layers } from "lucide-react";

interface VariantGroup {
  id: string;
  parentSku: string;
  productName: string;
  variantOptions: string[];
  totalVariants: number;
  status: string;
}

export default function ProductVariantsPage() {
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);

  return (
    <div className="space-y-8 font-sans">
      <PageHero
        title="Product Variants Studio"
        description="Manage parent-child SKU variant matrix, colorway options, size dimensions, and multi-channel variant publishing rules."
        actions={
          <button
            onClick={() => alert("Opening Variant Matrix Generator...")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Create Variant Matrix</span>
          </button>
        }
      />

      {/* Variant Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {variantGroups.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
              <tr>
                <th className="px-6 py-4">Matrix ID</th>
                <th className="px-6 py-4">Parent SKU</th>
                <th className="px-6 py-4">Master Product Name</th>
                <th className="px-6 py-4">Active Variant Dimensions</th>
                <th className="px-6 py-4 text-center">Child SKUs</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {variantGroups.map((group) => (
                <tr key={group.id} className="hover:bg-indigo-50/20 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      {group.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">{group.parentSku}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{group.productName}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {group.variantOptions.map((opt, idx) => (
                        <span key={idx} className="rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                          {opt}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-mono text-xs font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      {group.totalVariants} Variants
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" /> {group.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center space-y-3 bg-slate-50">
            <Layers className="h-10 w-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">No Product Variant Matrices Created</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No variant matrices defined for this tenant yet. Create your first SKU variant matrix using the button above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
