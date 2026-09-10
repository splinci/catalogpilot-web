"use client";

import { useState } from "react";

import type { Category } from "@/domains/category/types/category";

import { CategoryHeader } from "@/features/categories/components/CategoryHeader";
import { CategoryStats } from "@/features/categories/components/CategoryStats";
import { CategoryTable } from "@/features/categories/components/CategoryTable";
import { CategoryDialog } from "@/features/categories/components/CategoryDialog";
import { ArchiveCategoryDialog } from "@/features/categories/components/ArchiveCategoryDialog";

export default function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const [archiveOpen, setArchiveOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState<Category>();

  function handleAddCategory() {
    setSelectedCategory(undefined);
    setDialogOpen(true);
  }

  function handleEditCategory(category: Category) {
    setSelectedCategory(category);
    setDialogOpen(true);
  }

  function handleArchiveCategory(category: Category) {
    setSelectedCategory(category);
    setArchiveOpen(true);
  }

  return (
    <div>
      <CategoryHeader
        onAddCategory={handleAddCategory}
      />

      <CategoryStats />

      <CategoryTable
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onArchiveCategory={handleArchiveCategory}
      />

      <CategoryDialog
        open={dialogOpen}
        category={selectedCategory}
        onOpenChange={(open) => {
          setDialogOpen(open);

          if (!open) {
            setSelectedCategory(undefined);
          }
        }}
      />

      <ArchiveCategoryDialog
        open={archiveOpen}
        category={selectedCategory}
        onOpenChange={(open) => {
          setArchiveOpen(open);

          if (!open) {
            setSelectedCategory(undefined);
          }
        }}
      />
    </div>
  );
}