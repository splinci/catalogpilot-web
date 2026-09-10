"use client";

import { AdminDialog } from "@/features/administration/components/AdminDialog";

import { SalesChannelForm } from "./SalesChannelForm";

import type { SalesChannelModel } from "@/domains/sales-channel/types/sales-channel";

interface SalesChannelDialogProps {
  open: boolean;
  channel?: SalesChannelModel;

  onClose: () => void;
}

export function SalesChannelDialog({
  open,
  channel,
  onClose,
}: SalesChannelDialogProps) {
  return (
    <AdminDialog
      open={open}
      title={
        channel
          ? "Edit Sales Channel"
          : "Add Sales Channel"
      }
      onOpenChange={(value) => {
        if (!value) {
          onClose();
        }
      }}
    >
      <SalesChannelForm
  channel={channel}
  onSuccess={() => {
    onClose();
  }}
  onCancel={onClose}
/>
    </AdminDialog>
  );
}