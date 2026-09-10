"use client";

import { PageHero } from "@/components/layout/PageHero";
import { useFinanceDashboard } from "@/features/finance/hooks/useFinanceDashboard";
import { useReceivables } from "@/features/finance/hooks/useReceivables";
import { useInvoices } from "@/features/finance/hooks/useInvoices";
import { FinanceKPIs } from "@/features/finance/components/FinanceKPIs";
import { ReceivablesAgingTable } from "@/features/finance/components/ReceivablesAgingTable";
import { InvoiceTable } from "@/features/finance/components/InvoiceTable";
import Link from "next/link";
import { FileText, DollarSign, Clock } from "lucide-react";

export default function FinancePage() {
  const { metrics, loading: metricsLoading } = useFinanceDashboard();
  const { report, loading: reportLoading } = useReceivables();
  const { invoices, loading: invoicesLoading, issueInvoice, voidInvoice } = useInvoices();

  return (
    <div className="space-y-6">
      <PageHero
        title="Executive Finance & Invoicing"
        description="Accounts Receivable (AR) billing engine, payment allocations, credit notes, and financial aging ledgers."
        actions={
          <div className="flex gap-2">
            <Link
              href="/finance/invoices"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-2xs"
            >
              <FileText className="h-4 w-4" /> Invoice Directory
            </Link>
            <Link
              href="/finance/payments"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-2xs"
            >
              <DollarSign className="h-4 w-4" /> Payments History
            </Link>
            <Link
              href="/finance/receivables"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 transition-colors shadow-2xs"
            >
              <Clock className="h-4 w-4" /> Aging Report
            </Link>
          </div>
        }
      />

      <FinanceKPIs metrics={metrics} loading={metricsLoading} />

      <ReceivablesAgingTable report={report} loading={reportLoading} />

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recent Customer Invoices</h3>
          <Link href="/finance/invoices" className="text-xs font-semibold text-blue-600 hover:underline">
            View All Invoices &rarr;
          </Link>
        </div>
        <InvoiceTable
          invoices={invoices.slice(0, 5)}
          loading={invoicesLoading}
          onIssueInvoice={(inv) => issueInvoice(inv.id)}
          onVoidInvoice={(inv) => voidInvoice(inv.id)}
        />
      </div>
    </div>
  );
}
