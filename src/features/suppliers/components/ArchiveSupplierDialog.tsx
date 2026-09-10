"use client";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";

import { useSuppliers } from "@/hooks/useSuppliers";

import type { Supplier } from "@/domains/supplier/types/supplier";

interface ArchiveSupplierDialogProps {
  open: boolean;
  supplier?: Supplier;
  onOpenChange: (open: boolean) => void;
}

export function ArchiveSupplierDialog({
  open,
  supplier,
  onOpenChange,
}: ArchiveSupplierDialogProps) {
  const { archiveSupplier } = useSuppliers();

  async function handleConfirm() {
    if (!supplier) return;

    try {
      await archiveSupplier(supplier.id);

      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <ConfirmDialog
      open={open}
      title="Archive Supplier"
      description={`Are you sure you want to archive "${supplier?.name}"?`}
      confirmLabel="Archive"
      cancelLabel="Cancel"
      onConfirm={handleConfirm}
      onCancel={() => onOpenChange(false)}
    />
  );
}