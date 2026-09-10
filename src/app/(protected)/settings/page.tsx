
"use client";

import { PageHero } from "@/components/layout/PageHero";
import { Building, ShieldCheck, Key, Bell, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHero
        title="System & Company Settings"
        description="Configure your Atlas ERP company profile, security policies, API integrations, and system defaults."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Info Panel */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Building className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Company Information</h3>
              <p className="text-xs text-slate-500">Legal entity & branding defaults</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Company Name</label>
              <input
                type="text"
                defaultValue="Atlas Commerce Corp"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">System Code</label>
              <input
                type="text"
                defaultValue="ATLAS"
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-sm font-mono text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Security & Access Panel */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Security & Authentication</h3>
              <p className="text-xs text-slate-500">Argon2 password & session policies</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-700">Enforce Argon2 Password Hashing</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-700">HTTP-Only Cookie Sessions</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}