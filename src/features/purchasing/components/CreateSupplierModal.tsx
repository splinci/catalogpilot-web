"use client";

import { useState } from "react";
import { CreateSupplierInput } from "@/types/purchasing.dto";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSupplierInput) => Promise<void>;
}

export function CreateSupplierModal({ isOpen, onClose, onSubmit }: Props) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError("");
    if (!code.trim() || !name.trim()) {
      setError("Supplier code and name are required.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        code,
        name,
        email: email || undefined,
        phone: phone || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create supplier.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-5">
        <h2 className="text-xl font-bold text-slate-900">Add New Supplier</h2>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Supplier Code</label>
            <input
              type="text"
              placeholder="e.g. SUPP-ACME"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Supplier Name</label>
            <input
              type="text"
              placeholder="e.g. Acme Components Inc"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="orders@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="+1 (555) 0199"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-800"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Saving..." : "Add Supplier"}
          </button>
        </div>
      </div>
    </div>
  );
}
