"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/Button";

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

  const [loading, setLoading] = useState(false);

  async function handleArchive() {
    if (!product) return;

    try {
      setLoading(true);

      await archiveProduct(product.id);

      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Archive Product
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to archive
            this product?
          </p>

          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="font-medium">
              {product?.name}
            </p>

            <p className="text-sm text-slate-500">
              {product?.sku}
            </p>
          </div>

          <p className="text-sm text-slate-500">
            Archived products will no longer
            appear in the active inventory list.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={handleArchive}
            disabled={loading}
          >
            {loading
              ? "Archiving..."
              : "Archive Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}