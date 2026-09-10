"use client";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";

import { useCategories } from "@/hooks/useCategories";

import type { Category } from "@/domains/category/types/category";

interface ArchiveCategoryDialogProps {
  open: boolean;
  category?: Category;
  onOpenChange: (open: boolean) => void;
}

export function ArchiveCategoryDialog({
  open,
  category,
  onOpenChange,
}: ArchiveCategoryDialogProps) {
  const { archiveCategory } = useCategories();

  async function handleConfirm() {
    if (!category) return;

    try {
      await archiveCategory(category.id);

      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <ConfirmDialog
      open={open}
      title="Archive Category"
      description={`Are you sure you want to archive "${category?.name}"?`}
      confirmLabel="Archive"
      cancelLabel="Cancel"
      onConfirm={handleConfirm}
      onCancel={() => onOpenChange(false)}
    />
  );
}