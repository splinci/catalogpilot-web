"use client";

import { useMemo, useState } from "react";
import { Archive, SquarePen, Tags } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useCategories } from "@/hooks/useCategories";
import type { Category } from "@/domains/category/types/category";
import { CategorySearch } from "./CategorySearch";

interface CategoryTableProps {
  onEditCategory: (category: Category) => void;
  onArchiveCategory: (category: Category) => void;
  onAddCategory: () => void;
}

export function CategoryTable({
  onEditCategory,
  onArchiveCategory,
  onAddCategory,
}: CategoryTableProps) {
  const { categories, loading, error } = useCategories();
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const keyword = search.toLowerCase();

    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(keyword) ||
        category.code.toLowerCase().includes(keyword)
    );
  }, [categories, search]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
        <LoadingSpinner message="Loading product categories..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 font-semibold shadow-xs">
        ⚠️ Failed to load categories. Please try again.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      {/* Search Bar Toolbar */}
      <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50/80">
        <div className="max-w-md">
          <CategorySearch value={search} onChange={setSearch} />
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <EmptyState
          title="No Categories Found"
          description="Create your first category to organize your products."
          action={
            <button
              onClick={onAddCategory}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              + Add Category
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 shadow-2xs">
                      {category.code}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {category.name}
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-500">
                    {category.description ?? "-"}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={category.status} />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEditCategory(category)}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-2xs"
                        title="Edit Category"
                      >
                        <SquarePen className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onArchiveCategory(category)}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all shadow-2xs"
                        title="Archive Category"
                      >
                        <Archive className="h-4 w-4" />
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