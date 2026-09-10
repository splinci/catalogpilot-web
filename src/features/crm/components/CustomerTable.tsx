"use client";

import { Customer } from "../hooks/useCustomers";
import { CustomerStatusBadge } from "./CustomerStatusBadge";
import { Users, Eye, Archive } from "lucide-react";
import Link from "next/link";

interface Props {
  customers: Customer[];
  loading: boolean;
  onArchiveCustomer?: (customer: Customer) => void;
}

export function CustomerTable({ customers, loading, onArchiveCustomer }: Props) {
  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading customer directory...</div>;
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="p-12 text-center">
        <Users className="mx-auto h-10 w-10 text-slate-400 mb-3" />
        <h3 className="text-base font-bold text-slate-900">No Customers Found</h3>
        <p className="text-xs text-slate-500 mt-1">Create your first B2B customer master record.</p>
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
                <Link href={`/customers/${c.id}`}>{c.legalName}</Link>
                <div className="text-xs font-normal text-slate-400">{c.email}</div>
              </td>
              <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                {c.contacts && c.contacts.length > 0 ? c.contacts[0].name : c.phone || "N/A"}
              </td>
              <td className="px-6 py-4 text-right font-black text-slate-900 text-base">
                ${Number(c.creditLimit).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </td>
              <td className="px-6 py-4 text-center">
                <CustomerStatusBadge creditHold={c.creditHold} />
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <Link
                  href={`/customers/${c.id}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                >
                  <Eye className="h-3.5 w-3.5" /> View Detail
                </Link>
                <button
                  onClick={() => onArchiveCustomer?.(c)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 hover:bg-red-600 hover:text-white transition-colors shadow-2xs cursor-pointer"
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
