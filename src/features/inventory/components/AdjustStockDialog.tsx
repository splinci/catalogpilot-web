"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { AdjustStockForm } from "./AdjustStockForm";

interface AdjustStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    sku: string;
    name: string;
    currentStock: number;
  } | null;
}

export function AdjustStockDialog({
  open,
  onOpenChange,
  product,
}: AdjustStockDialogProps) {
  if (!product) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Adjust Stock
          </DialogTitle>
        </DialogHeader>

        <AdjustStockForm
          product={product}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}