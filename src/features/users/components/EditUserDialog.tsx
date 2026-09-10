"use client";

import { UserForm } from "./UserForm";
import { useState } from "react";
import { UserListItem } from "../types/user";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditUserDialogProps {
  open: boolean;
  user: UserListItem | null;

  roles: {
    id: string;
    name: string;
  }[];

  onSave: (values: {
    firstName: string;
    lastName: string;
    email: string;
    roleId: string;
    status?: string;
    password?: string;
  }) => Promise<void>;

  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({
  open,
  user,
  roles,
  onSave,
  onOpenChange,
}: EditUserDialogProps) {
  if (!user) return null;
  const [submitting, setSubmitting] = useState(false);

  const initialRoleId =
    user.userRoles?.[0]?.role?.id ??
    (user as any).roles?.[0]?.id ??
    (user as any).roleId ??
    "";

  const userStatus = user.status || ((user as any).isActive !== false ? "ACTIVE" : "INACTIVE");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Account</DialogTitle>
          <DialogDescription>Update Splinci team member details, email, password, or status.</DialogDescription>
        </DialogHeader>

        <UserForm
          initialValues={{
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            roleId: initialRoleId,
            status: userStatus,
            password: "",
          }}
          roles={roles}
          isEdit={true}
          submitLabel="Update User Account"
          submitting={submitting}
          onSubmit={async (values) => {
            try {
              setSubmitting(true);
              await onSave(values);
              onOpenChange(false);
            } finally {
              setSubmitting(false);
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}