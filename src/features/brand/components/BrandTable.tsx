"use client";

import { SquarePen, Trash2, Globe, Shapes } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Brand } from "@/domains/brand/types/brand";

interface BrandTableProps {
  brands: Brand[];
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
}

export function BrandTable({
  brands,
  onEdit,
  onDelete,
}: BrandTableProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      {brands.length === 0 ? (
        <EmptyState
          title="No Brands Found"
          description="Create your first product brand to organize your catalog."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Brand</th>
                <th className="px-6 py-4">Website</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 shadow-2xs">
                      {brand.code}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                      <Shapes className="h-3.5 w-3.5 text-indigo-600" />
                      <span>{brand.name}</span>
                    </div>

                    <div className="mt-0.5 text-xs text-slate-500">
                      {brand.description || "No description"}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-xs font-semibold">
                    {brand.websiteUrl ? (
                      <a
                        href={brand.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                      >
                        <Globe className="h-3 w-3" />
                        <span>{new URL(brand.websiteUrl).hostname.replace("www.", "")}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={brand.enabled ? "ACTIVE" : "INACTIVE"} />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEdit(brand)}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-2xs"
                        title="Edit Brand"
                      >
                        <SquarePen className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onDelete(brand)}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all shadow-2xs"
                        title="Delete Brand"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}