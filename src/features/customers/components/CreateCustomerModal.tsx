"use client";

import { useState } from "react";
import { CreateCustomerInput } from "@/types/crm.dto";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomerInput) => Promise<void>;
}

export function CreateCustomerModal({ isOpen, onClose, onSubmit }: Props) {
  const [legalName, setLegalName] = useState("");
  const [customerCode, setCustomerCode] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [creditLimit, setCreditLimit] = useState(25000);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError("");
    if (!legalName.trim() || !email.trim()) {
      setError("Legal Name and Primary Email are required.");
      return;
    }

    setSubmitting(true);
    try {
      const contacts = contactName.trim()
        ? [
            {
              firstName: contactName.split(" ")[0] || contactName,
              lastName: contactName.split(" ").slice(1).join(" ") || "Contact",
              email: contactEmail.trim() || email,
              isPrimary: true,
            },
          ]
        : [];

      await onSubmit({
        legalName: legalName.trim(),
        customerCode: customerCode.trim() || undefined,
        email: email.trim(),
        phone: phone.trim() || undefined,
        creditLimit: Number(creditLimit),
        creditHold: false,
        contacts,
        addresses: [],
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create customer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl space-y-5">
        <h2 className="text-xl font-bold text-slate-900">Create Enterprise Customer</h2>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Customer Legal Name</label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="Acme Enterprise Corp"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Customer Code (Optional)</label>
              <input
                type="text"
                value={customerCode}
                onChange={(e) => setCustomerCode(e.target.value)}
                placeholder="CUST-1002"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Primary Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="billing@acmecorp.com"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-semibold text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Credit Limit ($)</label>
            <input
              type="number"
              value={creditLimit}
              onChange={(e) => setCreditLimit(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-semibold text-slate-800"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-700">Primary Contact Person (Optional)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="John Doe"
                className="rounded-lg border bg-white p-2 text-xs font-semibold text-slate-800"
              />
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="johndoe@acmecorp.com"
                className="rounded-lg border bg-white p-2 text-xs font-semibold text-slate-800"
              />
            </div>
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
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Creating..." : "Create Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}
