"use client";

import { PageHero } from "@/components/layout/PageHero";
import { FileText } from "lucide-react";

export default function CreditNotesPage() {
  return (
    <div className="space-y-6">
      <PageHero
        title="Credit Notes & Memos"
        description="Customer credit memos offsetting open invoices, discounts, and billing adjustments."
      />

      <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
        <FileText className="mx-auto h-10 w-10 text-slate-400 mb-3" />
        <h3 className="text-base font-bold text-slate-900">Credit Notes Ledger</h3>
        <p className="text-xs text-slate-500 mt-1">Issue credit notes against customer accounts to offset outstanding balances.</p>
      </div>
    </div>
  );
}
