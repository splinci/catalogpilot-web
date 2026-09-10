"use client";

import { RefreshCw } from "lucide-react";
import { useFinanceReports } from "@/features/reporting/hooks/useFinanceReports";
import { FinanceOverviewCard } from "@/features/reporting/components/FinanceOverviewCard";
import { ARAgingChart } from "@/features/reporting/components/ARAgingChart";
import { ReportExportMenu } from "@/features/reporting/components/ReportExportMenu";
import { ChartSkeleton, LoadingSkeleton, TableSkeleton } from "@/features/reporting/components/LoadingSkeleton";
import { ErrorState } from "@/features/reporting/components/EmptyState";

function DataTable({ title, headers, rows }: { title: string; headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {headers.map((h) => <th key={h} className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={headers.length} className="px-4 py-8 text-center text-slate-400 text-sm">No data available.</td></tr>
            ) : rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                {row.map((cell, j) => <td key={j} className="px-4 py-3 text-slate-700 font-medium">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReportingFinancePage() {
  const { data, loading, error, refetch } = useFinanceReports();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Finance & Accounting Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Revenue, AR aging buckets, collections, and profitability analysis.</p>
        </div>
        <div className="flex items-center gap-2">
          <ReportExportMenu reportName="Finance & Accounting Reports" />
          <button onClick={refetch} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={refetch} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <><LoadingSkeleton className="h-64" /><ChartSkeleton height="h-64" /></>
        ) : (
          <>
            <FinanceOverviewCard
              totalRevenue={data?.revenue?.totalRevenue}
              grossProfit={data?.profitability?.grossProfit}
              grossMarginPercent={data?.profitability?.grossMarginPercent}
              netProfit={data?.profitability?.netProfit}
              netMarginPercent={data?.profitability?.netMarginPercent}
              receivables={data?.receivables?.totalOutstanding}
              collectionRate={data?.collections?.collectionRate}
            />
            <ARAgingChart
              current={data?.aging?.current}
              days31_60={data?.aging?.days31_60}
              days61_90={data?.aging?.days61_90}
              days91_120={data?.aging?.days91_120}
              over120={data?.aging?.over120}
            />
          </>
        )}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          <><TableSkeleton /><TableSkeleton /></>
        ) : (
          <>
            <DataTable
              title="Top Accounts Receivable Invoices"
              headers={["Customer", "Invoice #", "Amount", "Due Date", "Status"]}
              rows={data?.receivables?.topOutstanding?.slice(0, 10).map(inv => [inv.customerName ?? "—", inv.invoiceNumber ?? "—", inv.amount != null ? `$${inv.amount.toFixed(2)}` : "—", inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—", inv.status ?? "—"]) ?? []}
            />
            <DataTable
              title="Recent Payment Collections"
              headers={["Customer", "Amount", "Paid At", "Method", "Invoice #"]}
              rows={data?.payments?.recent?.slice(0, 10).map(p => [p.customerName ?? "—", p.amount != null ? `$${p.amount.toFixed(2)}` : "—", p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—", p.method ?? "—", p.invoiceNumber ?? "—"]) ?? []}
            />
          </>
        )}
      </div>
    </div>
  );
}
