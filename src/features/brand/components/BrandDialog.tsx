"use client";

import { AdminDialog } from "@/features/administration/components/AdminDialog";

import { BrandForm } from "./BrandForm";

import type { Brand } from "@/domains/brand/types/brand";

interface BrandDialogProps {
  open: boolean;
  brand?: Brand;

  onClose: () => void;
}

export function BrandDialog({
  open,
  brand,
  onClose,
}: BrandDialogProps) {
  return (
    <AdminDialog
      open={open}
      title={
        brand
          ? "Edit Brand"
          : "Add Brand"
      }
      onOpenChange={(value) => {
        if (!value) {
          onClose();
        }
      }}
    >
      <BrandForm
        brand={brand}
        onSuccess={() => {
          onClose();
        }}
        onCancel={onClose}
      />
    </AdminDialog>
  );
}