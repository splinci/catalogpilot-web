"use client";

import { UserListItem } from "../types/user";
import { SquarePen, Shield, Trash2, Power } from "lucide-react";

interface UsersTableProps {
  users: UserListItem[];
  onEdit: (user: UserListItem) => void;
  onToggleStatus?: (user: UserListItem) => void;
  onDelete?: (user: UserListItem) => void;
}

export function UsersTable({ users = [], onEdit, onToggleStatus, onDelete }: UsersTableProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
            <tr>
              <th className="px-6 py-4">User Name</th>
              <th className="px-6 py-4">Email Address</th>
              <th className="px-6 py-4">Assigned Roles</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const statusText = user.status || ((user as any).isActive !== false ? "ACTIVE" : "INACTIVE");
              const isActive = statusText === "ACTIVE";
              const rolesList = user.userRoles || [];
              const roleName = (user as any).role || (rolesList[0]?.role?.name ?? null);

              return (
                <tr key={user.id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-black text-xs">
                      {user.firstName ? user.firstName[0].toUpperCase() : "U"}
                    </div>
                    <span>
                      {user.firstName} {user.lastName}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-xs font-semibold text-indigo-600">
                    {user.email}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {rolesList.length > 0 ? (
                        rolesList.map((r) => (
                          <span
                            key={r.role?.id || r.role?.name}
                            className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-indigo-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800"
                          >
                            <Shield className="h-3 w-3 text-indigo-400" />
                            <span>{r.role?.name}</span>
                          </span>
                        ))
                      ) : roleName ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-indigo-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                          <Shield className="h-3 w-3 text-indigo-400" />
                          <span>{roleName}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">No Role Assigned</span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {statusText}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onToggleStatus?.(user)}
                        className={`rounded-lg border p-1.5 transition-all shadow-2xs ${
                          isActive
                            ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white"
                        }`}
                        title={isActive ? "Deactivate Account" : "Activate Account"}
                      >
                        <Power className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => onEdit(user)}
                        className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-2xs"
                        title="Edit User Details, Email & Password"
                      >
                        <SquarePen className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to permanently delete user ${user.firstName} ${user.lastName}?`)) {
                            onDelete?.(user);
                          }
                        }}
                        className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-2xs"
                        title="Delete User Account"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}