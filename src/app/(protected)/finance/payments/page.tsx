"use client";

import { PageHero } from "@/components/layout/PageHero";
import { usePayments } from "@/features/finance/hooks/usePayments";
import { DollarSign } from "lucide-react";

export default function PaymentsPage() {
  const { payments, loading } = usePayments();

  return (
    <div className="space-y-6">
      <PageHero
        title="Incoming Payments Ledger"
        description="Recorded customer payment transactions, payment allocations, and wire/ACH payment methods."
      />

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading payment ledger...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="mx-auto h-10 w-10 text-slate-400 mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Payments Recorded</h3>
            <p className="text-xs text-slate-500 mt-1">Record incoming payments against customer invoices.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
                <tr>
                  <th className="px-6 py-4">Invoice Number</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4 text-right">Payment Amount</th>
                  <th className="px-6 py-4 text-center">Payment Method</th>
                  <th className="px-6 py-4 text-right">Payment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">
                      {p.invoice?.invoiceNumber || p.invoiceId}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {p.invoice?.customer?.legalName || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-emerald-600 text-base">
                      +${Number(p.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                        {p.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-semibold text-slate-700">
                      {new Date(p.paidAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
