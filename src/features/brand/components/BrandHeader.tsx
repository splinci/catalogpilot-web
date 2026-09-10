"use client";

import { Plus, Shapes } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";

interface BrandHeaderProps {
  onAddBrand: () => void;
}

export function BrandHeader({
  onAddBrand,
}: BrandHeaderProps) {
  return (
    <div className="mb-6">
      <PageHero
        title="Brand Master Directory"
        description="Manage product manufacturer brands, trade names, and brand attributes across your catalog."
        actions={
          <button
            onClick={onAddBrand}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Brand</span>
          </button>
        }
      />
    </div>
  );
}