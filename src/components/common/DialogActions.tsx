"use client";

import { Button } from "@/components/ui/Button";

interface DialogActionsProps {
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

export function DialogActions({
  onCancel,
  loading = false,
  submitLabel = "Save",
  cancelLabel = "Cancel",
}: DialogActionsProps) {
  return (
    <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={loading}
      >
        {cancelLabel}
      </Button>

      <Button
        type="submit"
        disabled={loading}
      >
        {loading ? "Saving..." : submitLabel}
      </Button>
    </div>
  );
}