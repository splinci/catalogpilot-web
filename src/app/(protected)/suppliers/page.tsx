"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { useSuppliers } from "@/features/purchasing/hooks/useSuppliers";
import { SupplierTable } from "@/features/purchasing/components/SupplierTable";
import { CreateSupplierModal } from "@/features/purchasing/components/CreateSupplierModal";

export default function SuppliersPage() {
  const { suppliers = [], loading, createSupplier } = useSuppliers();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];
  const filteredSuppliers = safeSuppliers.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.code?.toLowerCase().includes(search.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHero
        title="Supplier Master Directory"
        description="Manage vendor profiles, contact details, unique supplier codes, and track purchase order fulfillment volume."
        actions={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Supplier</span>
          </button>
        }
      />

      <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search suppliers by name, code, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border-0 py-2 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <SupplierTable suppliers={filteredSuppliers} loading={loading} />

      <CreateSupplierModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={createSupplier}
      />
    </div>
  );
}