"use client";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";

import { useProducts } from "@/hooks/useProducts";

import type { Product } from "@/domains/product/types/product";

interface ArchiveProductDialogProps {
  open: boolean;
  product?: Product;
  onOpenChange: (open: boolean) => void;
}

export function ArchiveProductDialog({
  open,
  product,
  onOpenChange,
}: ArchiveProductDialogProps) {
  const { archiveProduct } = useProducts();

  async function handleConfirm() {
    if (!product) return;

    try {
      await archiveProduct(product.id);

      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <ConfirmDialog
      open={open}
      title="Archive Product"
      description={`Are you sure you want to archive "${product?.name}"?`}
      confirmLabel="Archive"
      cancelLabel="Cancel"
      onConfirm={handleConfirm}
      onCancel={() => onOpenChange(false)}
    />
  );
}