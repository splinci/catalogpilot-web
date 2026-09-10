"use client";

import { Invoice } from "../hooks/useInvoices";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { FileText, Send, DollarSign, XCircle } from "lucide-react";

interface Props {
  invoices: Invoice[];
  loading: boolean;
  onIssueInvoice?: (invoice: Invoice) => void;
  onRecordPayment?: (invoice: Invoice) => void;
  onVoidInvoice?: (invoice: Invoice) => void;
}

export function InvoiceTable({ invoices, loading, onIssueInvoice, onRecordPayment, onVoidInvoice }: Props) {
  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading billing invoices...</div>;
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="p-12 text-center">
        <FileText className="mx-auto h-10 w-10 text-slate-400 mb-3" />
        <h3 className="text-base font-bold text-slate-900">No Invoices Found</h3>
        <p className="text-xs text-slate-500 mt-1">Issue sales billing invoices from customer orders.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
          <tr>
            <th className="px-6 py-4">Invoice Number</th>
            <th className="px-6 py-4">Customer</th>
            <th className="px-6 py-4 text-right">Total Amount</th>
            <th className="px-6 py-4 text-center">Status</th>
            <th className="px-6 py-4 text-right">Due Date</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {invoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-blue-50/20 transition-colors group">
              <td className="px-6 py-4">
                <span className="font-mono text-xs font-bold text-blue-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 shadow-2xs">
                  {inv.invoiceNumber}
                </span>
              </td>
              <td className="px-6 py-4 font-bold text-slate-900">
                {inv.customer?.legalName || "N/A"}
                <div className="text-xs font-normal text-slate-400">{inv.customer?.email}</div>
              </td>
              <td className="px-6 py-4 text-right font-black text-slate-900 text-base">
                ${Number(inv.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </td>
              <td className="px-6 py-4 text-center">
                <InvoiceStatusBadge status={inv.status} />
              </td>
              <td className="px-6 py-4 text-right text-xs font-semibold text-slate-700">
                {new Date(inv.dueDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                {inv.status === "DRAFT" && (
                  <button
                    onClick={() => onIssueInvoice?.(inv)}
                    className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer shadow-2xs"
                  >
                    <Send className="h-3.5 w-3.5" /> Issue
                  </button>
                )}
                {inv.status === "ISSUED" && (
                  <button
                    onClick={() => onRecordPayment?.(inv)}
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer shadow-2xs"
                  >
                    <DollarSign className="h-3.5 w-3.5" /> Record Payment
                  </button>
                )}
                {inv.status !== "PAID" && inv.status !== "CANCELLED" && (
                  <button
                    onClick={() => onVoidInvoice?.(inv)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 hover:bg-red-600 hover:text-white transition-colors cursor-pointer shadow-2xs"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Void
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
