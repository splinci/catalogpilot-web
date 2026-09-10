"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdminDialogProps {
  open: boolean;
  title: string;

  onOpenChange: (open: boolean) => void;

  children: React.ReactNode;
}

export function AdminDialog({
  open,
  title,
  onOpenChange,
  children,
}: AdminDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {title}
          </DialogTitle>
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  );
}