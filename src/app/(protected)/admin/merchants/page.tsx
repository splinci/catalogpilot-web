"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Loader2,
  Users,
  Box,
  ShoppingCart,
  ExternalLink,
  RefreshCw,
  Filter,
  Building,
  Mail,
  ShieldCheck,
  AlertCircle,
  FlaskConical,
} from "lucide-react";

interface MerchantItem {
  id: string;
  code: string;
  legalName: string;
  displayName: string;
  taxId?: string;
  isActive: boolean;
  createdAt: string;
  primaryAdmin?: {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    status: string;
  } | null;
  counts: {
    users: number;
    products: number;
    orders: number;
  };
}

export default function ClientDirectoryPage() {
  const [merchants, setMerchants] = useState<MerchantItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "PENDING" | "TEST">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMerchants = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/merchants");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch merchant client directory.");
      }

      setMerchants(data.data || []);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while loading clients.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const isTestOrAuditTenant = (m: MerchantItem) => {
    const code = m.code.toUpperCase();
    const name = m.legalName.toUpperCase();
    return code.startsWith("MCH") || code.includes("TEST") || code.includes("AUDIT") || name.includes("AUDIT") || name.includes("TEST");
  };

  const filteredMerchants = merchants.filter((m) => {
    const matchesSearch =
      m.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.primaryAdmin?.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const isTest = isTestOrAuditTenant(m);
    const isActive = m.primaryAdmin?.isActive;

    if (activeTab === "ACTIVE") return isActive && !isTest;
    if (activeTab === "PENDING") return !isActive && !isTest;
    if (activeTab === "TEST") return isTest;

    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 font-sans text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl text-indigo-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Master Client Directory
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Splinci Platform Operations — Authoritative Merchant Tenants &amp; Onboarding Lifecycle Workspace
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMerchants}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/admin/merchants/onboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-black text-xs shadow-lg shadow-indigo-600/30 hover:scale-[1.01] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Client</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company name, code, or admin email..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { id: "ALL", label: "All Tenants" },
              { id: "ACTIVE", label: "Active" },
              { id: "PENDING", label: "Invitation Pending" },
              { id: "TEST", label: "Test / Audit" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium flex items-center justify-between border-t border-slate-850 pt-3">
          <span>Showing <strong className="text-slate-200">{filteredMerchants.length}</strong> of <strong className="text-slate-200">{merchants.length}</strong> merchant tenants</span>
          <span className="text-[11px] text-slate-500">Platform Isolation: Tenant data strictly segregated per company ID</span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Directory Content Table */}
      {isLoading ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
          <p className="text-xs font-medium">Loading Master Client Directory...</p>
        </div>
      ) : filteredMerchants.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center space-y-4">
          <Building2 className="w-12 h-12 mx-auto text-slate-600" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Merchant Clients Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No merchant tenant matched the selected filter or search criteria.
            </p>
          </div>
          <Link
            href="/admin/merchants/onboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Provision Client
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Merchant Organization</th>
                  <th className="px-6 py-4">Company Code</th>
                  <th className="px-6 py-4">Primary Administrator</th>
                  <th className="px-6 py-4">Onboarding Lifecycle</th>
                  <th className="px-6 py-4 text-center">Subsystem Metrics</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {filteredMerchants.map((m) => {
                  const isTest = isTestOrAuditTenant(m);
                  const isAdminActive = m.primaryAdmin?.isActive;

                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{m.displayName}</span>
                          {isTest && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400" title="Synthetic Test / Audit Tenant">
                              <FlaskConical className="w-3 h-3" /> TEST/AUDIT
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">{m.legalName}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                          {m.code}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {m.primaryAdmin ? (
                          <div>
                            <div className="font-semibold text-slate-200">{m.primaryAdmin.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{m.primaryAdmin.email}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No Admin User Assigned</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {isAdminActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> OPERATIONAL ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                            <Clock className="w-3 h-3" /> INVITATION PENDING
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-slate-400">
                          <span title="Users" className="flex items-center gap-1"><Users className="w-3 h-3 text-slate-500" /> {m.counts.users}</span>
                          <span title="Products" className="flex items-center gap-1"><Box className="w-3 h-3 text-slate-500" /> {m.counts.products}</span>
                          <span title="Orders" className="flex items-center gap-1"><ShoppingCart className="w-3 h-3 text-slate-500" /> {m.counts.orders}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/merchants/${m.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all"
                        >
                          <span>View Lifecycle Profile</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
