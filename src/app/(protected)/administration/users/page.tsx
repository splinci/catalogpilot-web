"use client";

import { useState, useEffect } from "react";
import { PageHero } from "@/components/layout/PageHero";
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserCheck,
  UserX,
  Trash2,
  Mail,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface TenantUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TenantUserManagementPage() {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviting, setInviting] = useState(false);

  // Invite Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MERCHANT_USER");

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.data || []);
      } else {
        setError(data.error || "Failed to fetch company user directory.");
      }
    } catch (err: any) {
      setError(err?.message || "Error loading user directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setInviting(true);
    try {
      const res = await fetch("/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, role }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Invitation sent successfully to ${email}!`);
        setIsInviteOpen(false);
        setFirstName("");
        setLastName("");
        setEmail("");
        fetchUsers();
      } else {
        alert(data.error || "Failed to send invitation.");
      }
    } catch (err: any) {
      alert(err?.message || "Error sending invitation.");
    } finally {
      setInviting(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchUsers();
      } else {
        alert(data.error || "Failed to update user status.");
      }
    } catch (err: any) {
      alert(err?.message || "Error updating user status.");
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove user ${email} from your company tenant?`)) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchUsers();
      } else {
        alert(data.error || "Failed to remove user.");
      }
    } catch (err: any) {
      alert(err?.message || "Error removing user.");
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <PageHero
        title="Tenant User Management &amp; Directory"
        description="Manage company team members, invite new administrators or catalog operators, assign RBAC roles, and manage access status."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
              title="Refresh Directory"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsInviteOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Invite Team Member</span>
            </button>
          </div>
        }
      />

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
            <p className="text-xs text-slate-500 font-medium">Loading company user directory...</p>
          </div>
        ) : users.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-indigo-50/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs">
                        {(u.firstName?.[0] || u.email[0]).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          {u.firstName || u.lastName ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : "Team Member"}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">ID: {u.id.slice(0, 12)}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">{u.email}</td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                      <ShieldCheck className="h-3 w-3 text-indigo-600" /> {u.role}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 border border-slate-200">
                        <UserX className="h-3 w-3 text-slate-500" /> DISABLED
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                        className={`rounded-lg border p-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                          u.isActive
                            ? "border-slate-200 bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                        title={u.isActive ? "Disable User" : "Activate User"}
                      >
                        {u.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u.id, u.email)}
                        className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all cursor-pointer shadow-2xs"
                        title="Remove User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center space-y-3 bg-slate-50">
            <Users className="h-10 w-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">No Team Members Found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No additional users registered in your tenant directory. Click below to invite team members.
            </p>
          </div>
        )}
      </div>

      {/* Invite User Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-600" />
                <span>Invite Team Member</span>
              </h3>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@company.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 focus:border-indigo-600 focus:outline-hidden"
                >
                  <option value="MERCHANT_USER">Catalog Operator / User</option>
                  <option value="ADMIN">Company Administrator</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  <span>Send Invitation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
