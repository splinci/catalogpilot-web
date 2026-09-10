"use client";

import { useMemo, useState } from "react";
import { Archive, SquarePen, Truck } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useSuppliers } from "@/hooks/useSuppliers";
import type { Supplier } from "@/domains/supplier/types/supplier";
import { SupplierSearch } from "./SupplierSearch";

interface SupplierTableProps {
  onEditSupplier: (supplier: Supplier) => void;
  onArchiveSupplier: (supplier: Supplier) => void;
  onAddSupplier: () => void;
}

export function SupplierTable({
  onEditSupplier,
  onArchiveSupplier,
  onAddSupplier,
}: SupplierTableProps) {
  const { suppliers, loading, error } = useSuppliers();
  const [search, setSearch] = useState("");

  const filteredSuppliers = useMemo(() => {
    const keyword = search.toLowerCase();

    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(keyword) ||
        supplier.code.toLowerCase().includes(keyword) ||
        supplier.contactPerson?.toLowerCase().includes(keyword) ||
        supplier.email?.toLowerCase().includes(keyword) ||
        supplier.phone?.toLowerCase().includes(keyword)
    );
  }, [suppliers, search]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
        <LoadingSpinner message="Loading suppliers directory..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 font-semibold shadow-xs">
        ⚠️ Failed to load suppliers.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      {/* Search Bar Toolbar */}
      <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50/80">
        <div className="max-w-md">
          <SupplierSearch value={search} onChange={setSearch} />
        </div>
      </div>

      {filteredSuppliers.length === 0 ? (
        <EmptyState
          title="No Suppliers Found"
          description="Create your first vendor supplier profile."
          action={
            <button
              onClick={onAddSupplier}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              + Add Supplier
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Supplier Name</th>
                <th className="px-6 py-4">Contact Person</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 shadow-2xs">
                      {supplier.code}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5 text-indigo-600" />
                    <span>{supplier.name}</span>
                  </td>

                  <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                    {supplier.contactPerson ?? "-"}
                  </td>

                  <td className="px-6 py-4 text-xs text-indigo-600 font-semibold">
                    {supplier.email ?? "-"}
                  </td>

                  <td className="px-6 py-4 text-xs font-mono text-slate-600">
                    {supplier.phone ?? "-"}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={supplier.status} />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEditSupplier(supplier)}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-2xs"
                        title="Edit Supplier"
                      >
                        <SquarePen className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onArchiveSupplier(supplier)}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all shadow-2xs"
                        title="Archive Supplier"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}