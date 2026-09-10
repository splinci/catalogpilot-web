"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { createUser, updateUser, deleteUser } from "../api/user.api";
import { useUsers } from "../hooks/useUsers";
import { UserListItem } from "../types/user";
import { UsersTable } from "./UsersTable";
import { NewUserDialog } from "./NewUserDialog";
import { EditUserDialog } from "./EditUserDialog";
import { useRoles } from "../hooks/useRoles";

export function UsersPage() {
  const { users, loading, refresh } = useUsers();
  const { roles, loading: rolesLoading } = useRoles();
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);

  const handleToggleStatus = async (user: UserListItem) => {
    const currentStatus = user.status || ((user as any).isActive !== false ? "ACTIVE" : "INACTIVE");
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await updateUser(user.id, { status: nextStatus });
    await refresh();
  };

  const handleDeleteUser = async (user: UserListItem) => {
    await deleteUser(user.id);
    await refresh();
  };

  return (
    <div className="space-y-6">
      <PageHero
        title="User Management & RBAC"
        description="Manage Splinci team member profiles, active/inactive statuses, credentials, access roles, and permissions."
        actions={
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add New User</span>
          </button>
        }
      />

      {loading || rolesLoading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center text-xs text-slate-400 shadow-xs">
          Loading user directory...
        </div>
      ) : (
        <UsersTable
          users={users}
          onEdit={(user) => setEditingUser(user)}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteUser}
        />
      )}

      <NewUserDialog
        open={open}
        onOpenChange={setOpen}
        roles={roles}
        onCreate={async (values) => {
          await createUser({
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            roleId: values.roleId,
          });
          await refresh();
        }}
      />

      <EditUserDialog
        open={editingUser !== null}
        user={editingUser}
        roles={roles}
        onOpenChange={(open) => {
          if (!open) {
            setEditingUser(null);
          }
        }}
        onSave={async (values) => {
          if (!editingUser) return;

          await updateUser(editingUser.id, {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            roleId: values.roleId,
            status: values.status,
            password: values.password,
          });

          await refresh();
          setEditingUser(null);
        }}
      />
    </div>
  );
}