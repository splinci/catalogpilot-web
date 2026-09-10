"use client";

import type { Product } from "@/domains/product/types/product";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ProductForm } from "./ProductForm";

interface ProductDialogProps {
  open: boolean;
  product?: Product;
  onOpenChange: (open: boolean) => void;
}

export function ProductDialog({
  open,
  product,
  onOpenChange,
}: ProductDialogProps) {
  function handleSuccess() {
    onOpenChange(false);
  }

  function handleCancel() {
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add Product"}
          </DialogTitle>
        </DialogHeader>

        <ProductForm
          product={product}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}