"use client";

import { SupplierItem } from "../hooks/useSuppliers";
import { Building2, Mail, Phone, ShoppingBag } from "lucide-react";

interface Props {
  suppliers: SupplierItem[];
  loading: boolean;
}

export function SupplierTable({ suppliers, loading }: Props) {
  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading supplier directory...</div>;
  }

  if (suppliers.length === 0) {
    return (
      <div className="p-12 text-center">
        <Building2 className="mx-auto h-10 w-10 text-slate-400 mb-3" />
        <h3 className="text-base font-bold text-slate-900">No Suppliers Found</h3>
        <p className="text-xs text-slate-500 mt-1">Add your first supplier master record to manage vendors.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {suppliers.map((supplier) => (
        <div key={supplier.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-indigo-400 bg-slate-900 px-2.5 py-0.5 rounded-md border border-slate-800">
                {supplier.code}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {supplier._count?.pos ?? 0} Orders
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-3">{supplier.name}</h3>

            <div className="space-y-1.5 mt-3 text-xs font-semibold text-slate-500">
              {supplier.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{supplier.email}</span>
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{supplier.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Added {new Date(supplier.createdAt).toLocaleDateString()}</span>
            <span className="inline-flex items-center gap-1 text-indigo-600">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Active Supplier</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
