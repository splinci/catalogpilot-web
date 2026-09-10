"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  UserForm,
  UserFormValues,
} from "./UserForm";

interface Role {
  id: string;
  name: string;
}

interface NewUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  roles: Role[];

  onCreate: (
    values: UserFormValues
  ) => Promise<void>;
}

export function NewUserDialog({
  open,
  onOpenChange,
  roles,
  onCreate,
}: NewUserDialogProps) {
  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    values: UserFormValues
  ) {
    try {
      setLoading(true);

      await onCreate(values);

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
      <DialogContent className="max-w-lg">

        <DialogHeader>
          <DialogTitle>
            Create User
          </DialogTitle>

          <DialogDescription>
            Add a new Atlas ERP user.
          </DialogDescription>
        </DialogHeader>

        <UserForm
          roles={roles}
          onSubmit={handleSubmit}
        />

        <DialogFooter>

          <Button
            variant="outline"
            onClick={() =>
              onOpenChange(false)
            }
          >
            Cancel
          </Button>

          <Button
            disabled={loading}
            onClick={() => {
              const form =
                document.querySelector(
                  "form"
                );

              form?.requestSubmit();
            }}
          >
            {loading
              ? "Creating..."
              : "Create User"}
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}