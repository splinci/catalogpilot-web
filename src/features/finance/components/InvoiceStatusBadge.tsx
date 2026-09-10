"use client";

import { CheckCircle2, FileText, Send, XCircle } from "lucide-react";

interface Props {
  status: "DRAFT" | "ISSUED" | "PAID" | "CANCELLED";
}

export function InvoiceStatusBadge({ status }: Props) {
  switch (status) {
    case "DRAFT":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200">
          <FileText className="h-3.5 w-3.5" /> Draft
        </span>
      );
    case "ISSUED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
          <Send className="h-3.5 w-3.5" /> Issued
        </span>
      );
    case "PAID":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5" /> Paid
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-200">
          <XCircle className="h-3.5 w-3.5" /> Voided
        </span>
      );
  }
}
