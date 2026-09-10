"use client";

import { CustomerAggregate } from "../hooks/useCustomers";
import { CheckCircle2, ShieldAlert, Users, Eye, Archive } from "lucide-react";

interface Props {
  customers: CustomerAggregate[];
  loading: boolean;
  onSelectCustomer?: (customer: CustomerAggregate) => void;
  onArchiveCustomer?: (customer: CustomerAggregate) => void;
}

export function CustomerTable({ customers, loading, onSelectCustomer, onArchiveCustomer }: Props) {
  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading customer directory...</div>;
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="p-12 text-center">
        <Users className="mx-auto h-10 w-10 text-slate-400 mb-3" />
        <h3 className="text-base font-bold text-slate-900">No Customers Found</h3>
        <p className="text-xs text-slate-500 mt-1">Create your first B2B enterprise customer master record.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
          <tr>
            <th className="px-6 py-4">Customer Code</th>
            <th className="px-6 py-4">Legal Name</th>
            <th className="px-6 py-4">Primary Contact</th>
            <th className="px-6 py-4 text-right">Credit Limit</th>
            <th className="px-6 py-4 text-center">Credit Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {customers.map((c) => (
            <tr key={c.id} className="hover:bg-blue-50/20 transition-colors group">
              <td className="px-6 py-4">
                <span className="font-mono text-xs font-bold text-blue-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 shadow-2xs">
                  {c.customerCode}
                </span>
              </td>
              <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {c.legalName}
                <div className="text-xs font-normal text-slate-400">{c.email}</div>
              </td>
              <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                {c.contacts && c.contacts.length > 0 ? c.contacts[0].name : c.phone || "N/A"}
              </td>
              <td className="px-6 py-4 text-right font-black text-slate-900 text-base">
                ${Number(c.creditLimit).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </td>
              <td className="px-6 py-4 text-center">
                {c.creditHold ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-200">
                    <ShieldAlert className="h-3.5 w-3.5" /> Credit Hold
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active Good Standing
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <button
                  onClick={() => onSelectCustomer?.(c)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
                >
                  <Eye className="h-3.5 w-3.5" /> View
                </button>
                <button
                  onClick={() => onArchiveCustomer?.(c)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 hover:bg-red-600 hover:text-white transition-colors cursor-pointer shadow-2xs"
                >
                  <Archive className="h-3.5 w-3.5" /> Archive
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}