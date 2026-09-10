"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Loader2,
  Users,
  Box,
  ShoppingCart,
  Building,
  Shield,
  Edit,
  Mail,
  Power,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [company, setCompany] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states & feedback
  const [editForm, setEditForm] = useState({ displayName: "", legalName: "", taxId: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchCompanyDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/merchants/${id}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch merchant details.");
      }

      setCompany(data.data);
      setEditForm({
        displayName: data.data.displayName || "",
        legalName: data.data.legalName || "",
        taxId: data.data.taxId || "",
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
        <p className="text-xs text-slate-400">Loading Client Tenant Profile...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <div>{error || "Merchant not found."}</div>
        </div>
        <Link
          href="/admin/merchants"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Client Directory
        </Link>
      </div>
    );
  }

  const primaryAdmin = company.users?.find((u: any) => u.role === "ADMIN") || company.users?.[0];
  const isInvitationPending = company.isActive && primaryAdmin && !primaryAdmin.isActive;
  const isActiveMerchant = company.isActive && primaryAdmin?.isActive;
  const isInactiveMerchant = !company.isActive;
  const isProtected = company.isProtected || ["SPLINCI", "ATLAS"].includes(company.code);

  const resendCount = company.resendCount || 0;
  const nextResendSequence = `RESEND-${resendCount + 1}`;

  // Actions Handlers
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/admin/merchants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update merchant specifications.");
      }

      setActionSuccess("Merchant specifications updated successfully.");
      setShowEditModal(false);
      await fetchCompanyDetail();
    } catch (err: any) {
      setActionError(err.message || "Edit failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async () => {
    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const newStatus = !company.isActive;
      const res = await fetch(`/api/admin/merchants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update merchant status.");
      }

      setActionSuccess(`Merchant ${newStatus ? "Activated" : "Deactivated"} successfully.`);
      setShowStatusModal(false);
      await fetchCompanyDetail();
    } catch (err: any) {
      setActionError(err.message || "Status update failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendInvitation = async () => {
    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/admin/merchants/${id}/resend-invitation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to resend invitation email.");
      }

      setActionSuccess(`Invitation email resent successfully (${data.data?.sequenceTag || nextResendSequence}).`);
      setShowResendModal(false);
      await fetchCompanyDetail();
    } catch (err: any) {
      setActionError(err.message || "Resend failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMerchant = async () => {
    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/admin/merchants/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete merchant.");
      }

      setShowDeleteModal(false);
      router.push("/admin/merchants");
    } catch (err: any) {
      setActionError(err.message || "Delete failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 font-sans text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Action Banner Feedback */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">{company.displayName}</h1>
                <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-lg">
                  {company.code}
                </span>
                {company.isActive ? (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    ACTIVE
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
                    INACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{company.legalName}</p>
            </div>
          </div>
        </div>

        <Link
          href="/admin/merchants"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Client Directory
        </Link>
      </div>

      {/* Merchant Lifecycle Actions Workspace Toolbar */}
      <div className="bg-slate-900/80 border border-indigo-500/20 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-300 uppercase tracking-wider">
          <Building className="w-4 h-4 text-indigo-400" />
          <span>Merchant Lifecycle Actions</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Action 1: Edit Merchant */}
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Merchant
          </button>

          {/* Action 2: Resend Invitation (Only if Invitation Pending) */}
          {isInvitationPending && (
            <button
              onClick={() => setShowResendModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20"
            >
              <Mail className="w-3.5 h-3.5" />
              Resend Invitation ({nextResendSequence})
            </button>
          )}

          {/* Action 3: Set Active / Deactivate */}
          <button
            onClick={() => setShowStatusModal(true)}
            disabled={isProtected && company.isActive}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              company.isActive
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
            } ${isProtected && company.isActive ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Power className="w-3.5 h-3.5" />
            {company.isActive ? "Set Inactive" : "Set Active"}
          </button>

          {/* Action 4: Delete Merchant */}
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={isProtected}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 ${
              isProtected ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Merchant
          </button>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-2 backdrop-blur-xl">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" /> Total Users
          </div>
          <div className="text-2xl font-black text-white">{company._count?.users || 0}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-2 backdrop-blur-xl">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-indigo-400" /> Catalog Products
          </div>
          <div className="text-2xl font-black text-white">{company._count?.products || 0}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-2 backdrop-blur-xl">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5 text-indigo-400" /> Sales Orders
          </div>
          <div className="text-2xl font-black text-white">{company._count?.salesOrders || 0}</div>
        </div>
      </div>

      {/* Details & Administrator Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Identity Details */}
        <div className="bg-slate-900/70 border border-slate-800/80 p-6 rounded-2xl space-y-4 backdrop-blur-xl shadow-xl">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Building className="w-4 h-4" /> Company Specifications
          </h2>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between border-b border-slate-850 pb-2">
              <span className="text-slate-500">Tenant ID:</span>
              <span className="text-slate-200">{company.id}</span>
            </div>
            <div className="flex justify-between border-b border-slate-850 pb-2">
              <span className="text-slate-500">Legal Name:</span>
              <span className="text-slate-200">{company.legalName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-850 pb-2">
              <span className="text-slate-500">Display Name:</span>
              <span className="text-slate-200">{company.displayName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-850 pb-2">
              <span className="text-slate-500">Company Code:</span>
              <span className="text-indigo-400 font-bold">{company.code}</span>
            </div>
            <div className="flex justify-between border-b border-slate-850 pb-2">
              <span className="text-slate-500">Tax / VAT ID:</span>
              <span className="text-slate-200">{company.taxId || "N/A"}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">Provisioned On:</span>
              <span className="text-slate-300">{new Date(company.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Primary Administrator */}
        <div className="bg-slate-900/70 border border-slate-800/80 p-6 rounded-2xl space-y-4 backdrop-blur-xl shadow-xl">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Primary Merchant Administrator
          </h2>

          {primaryAdmin ? (
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-500">Administrator Name:</span>
                <span className="text-slate-200">{primaryAdmin.firstName} {primaryAdmin.lastName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-500">Corporate Email:</span>
                <span className="text-indigo-300">{primaryAdmin.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-500">Assigned Role:</span>
                <span className="text-slate-200 font-bold">{primaryAdmin.role}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Account Activation:</span>
                {primaryAdmin.isActive ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> INVITATION PENDING ({resendCount > 0 ? `Resent ${resendCount}x` : "Original"})
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic py-4 text-center">
              No administrator account assigned to this company.
            </div>
          )}
        </div>
      </div>

      {/* Users List Table */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl space-y-4 p-6">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
          <Users className="w-4 h-4" /> Tenant Users Directory ({company.users?.length || 0})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">User Name</th>
                <th className="px-4 py-3">Corporate Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300 font-mono">
              {company.users?.map((u: any) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-sans font-semibold text-white">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-3 text-indigo-300">{u.email}</td>
                  <td className="px-4 py-3 font-bold text-slate-200">{u.role}</td>
                  <td className="px-4 py-3">
                    {u.isActive ? (
                      <span className="text-emerald-400 font-bold">ACTIVE</span>
                    ) : (
                      <span className="text-amber-400 font-bold">INVITATION_PENDING</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: EDIT MERCHANT */}
      {/* ---------------------------------------------------- */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-indigo-400" /> Edit Merchant Specifications
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Legal Name</label>
                <input
                  type="text"
                  required
                  value={editForm.legalName}
                  onChange={(e) => setEditForm({ ...editForm, legalName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tax / VAT ID</label>
                <input
                  type="text"
                  value={editForm.taxId}
                  onChange={(e) => setEditForm({ ...editForm, taxId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                  placeholder="Optional Tax Identification Number"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: RESEND INVITATION CONFIRMATION */}
      {/* ---------------------------------------------------- */}
      {showResendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" /> Resend Merchant Invitation?
              </h3>
              <button onClick={() => setShowResendModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 font-mono bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between border-b border-slate-850 pb-1.5">
                <span className="text-slate-500">Merchant:</span>
                <span className="text-white font-bold">{company.displayName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-1.5">
                <span className="text-slate-500">Administrator:</span>
                <span className="text-slate-200">{primaryAdmin?.firstName} {primaryAdmin?.lastName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-1.5">
                <span className="text-slate-500">Email:</span>
                <span className="text-indigo-300">{primaryAdmin?.email}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Invitation Sequence:</span>
                <span className="text-amber-400 font-bold">{nextResendSequence}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              This action will invalidate the currently active activation link and generate a new cryptographically secure single-use activation session.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowResendModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResendInvitation}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs disabled:opacity-50 shadow-md shadow-amber-600/20"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Resend Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: STATUS TOGGLE CONFIRMATION */}
      {/* ---------------------------------------------------- */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Power className="w-4 h-4 text-indigo-400" /> {company.isActive ? "Deactivate Merchant?" : "Activate Merchant?"}
              </h3>
              <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Are you sure you want to set <strong className="text-white">{company.displayName}</strong> to{" "}
              <strong className={company.isActive ? "text-rose-400" : "text-emerald-400"}>
                {company.isActive ? "INACTIVE" : "ACTIVE"}
              </strong>?
              {company.isActive
                ? " Merchant users will be blocked from accessing the system until reactivated. Existing data remains intact."
                : " Operational access will be restored for all active merchant users."}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusToggle}
                disabled={isSubmitting}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-white font-bold text-xs disabled:opacity-50 shadow-md ${
                  company.isActive ? "bg-rose-600 hover:bg-rose-500" : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm {company.isActive ? "Deactivation" : "Activation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 4: DELETE MERCHANT SAFETY CONFIRMATION */}
      {/* ---------------------------------------------------- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-rose-400 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete Merchant Tenant?
              </h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-2">
              <div className="font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Warning: Irreversible Tenant Removal</span>
              </div>
              <p className="leading-relaxed">
                You are about to delete <strong className="text-white">{company.displayName} ({company.code})</strong>.
              </p>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Deletion will be blocked if active operational business data (products, sales orders, invoices) exists for this tenant. Unused provisioned accounts will be permanently removed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteMerchant}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs disabled:opacity-50 shadow-md shadow-rose-600/20"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Delete Merchant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
