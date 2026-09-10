"use client";

import { Plus, Tag } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";

interface CategoryHeaderProps {
  onAddCategory: () => void;
}

export function CategoryHeader({
  onAddCategory,
}: CategoryHeaderProps) {
  return (
    <div className="mb-6">
      <PageHero
        title="Category Taxonomy Management"
        description="Organize your product catalog into structured categories and subcategories."
        actions={
          <button
            onClick={onAddCategory}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        }
      />
    </div>
  );
}