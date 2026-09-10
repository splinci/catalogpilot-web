"use client";

import { useState, useEffect } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Building2, Save, CheckCircle2, Shield, Globe, Mail, Phone, MapPin, Loader2 } from "lucide-react";

export default function CompanyProfilePage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [company, setCompany] = useState({
    legalName: "SM Galaxy Enterprise",
    code: "GALAXY",
    taxId: "TAX-99882341",
    email: "mohan@galaxy.com",
    phone: "+1 (555) 902-1248",
    website: "https://galaxy.com",
    address: "100 Enterprise Way, Suite 400, San Jose, CA 95110",
    timezone: "America/Los_Angeles",
    currency: "USD ($)",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-8 font-sans">
      <PageHero
        title="Tenant Company Profile &amp; Governance Settings"
        description="Manage company identity, tax registration, default currency, operating timezone, contact details, and multi-tenant domain preferences."
      />

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Company profile and governance settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-bold">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{company.legalName}</h3>
              <p className="text-xs text-slate-500 font-mono">Company Code: {company.code}</p>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Profile Changes</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
          <div className="space-y-1.5">
            <label className="text-slate-700 font-bold">Legal Entity Name</label>
            <input
              type="text"
              required
              value={company.legalName}
              onChange={(e) => setCompany({ ...company, legalName: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 font-bold focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 font-bold">Company Code / Prefix</label>
            <input
              type="text"
              readOnly
              value={company.code}
              className="w-full rounded-xl border border-slate-200 bg-slate-100 p-3 text-xs text-slate-500 font-mono font-bold cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 font-bold">Tax Registration / EIN</label>
            <input
              type="text"
              value={company.taxId}
              onChange={(e) => setCompany({ ...company, taxId: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 font-mono focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 font-bold">Official Billing Email</label>
            <input
              type="email"
              required
              value={company.email}
              onChange={(e) => setCompany({ ...company, email: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 font-bold">Phone Number</label>
            <input
              type="text"
              value={company.phone}
              onChange={(e) => setCompany({ ...company, phone: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 font-bold">Primary Corporate Website</label>
            <input
              type="url"
              value={company.website}
              onChange={(e) => setCompany({ ...company, website: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-slate-700 font-bold">Headquarters Address</label>
            <input
              type="text"
              value={company.address}
              onChange={(e) => setCompany({ ...company, address: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
