"use client";

import { useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { useInvoices } from "@/features/finance/hooks/useInvoices";
import { InvoiceTable } from "@/features/finance/components/InvoiceTable";
import { Search } from "lucide-react";

export default function InvoicesPage() {
  const { invoices, loading, issueInvoice, voidInvoice } = useInvoices();
  const [search, setSearch] = useState("");

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer?.legalName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHero
        title="Sales Invoices Directory"
        description="Accounts Receivable billing ledger, invoice issuing, payment status tracking, and void management."
      />

      <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoices by invoice number or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border-0 py-2 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <InvoiceTable
          invoices={filteredInvoices}
          loading={loading}
          onIssueInvoice={(inv) => issueInvoice(inv.id)}
          onVoidInvoice={(inv) => voidInvoice(inv.id)}
        />
      </div>
    </div>
  );
}
