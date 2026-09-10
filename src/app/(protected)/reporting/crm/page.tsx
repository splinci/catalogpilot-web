"use client";

import { RefreshCw } from "lucide-react";
import { useCRMReports } from "@/features/reporting/hooks/useCRMReports";
import { CustomerGrowthChart } from "@/features/reporting/components/CustomerGrowthChart";
import { CustomerSegmentationChart } from "@/features/reporting/components/CustomerSegmentationChart";
import { ReportExportMenu } from "@/features/reporting/components/ReportExportMenu";
import { ExecutiveKPICard } from "@/features/reporting/components/ExecutiveKPICards";
import { KPICardSkeleton, ChartSkeleton, TableSkeleton } from "@/features/reporting/components/LoadingSkeleton";
import { ErrorState } from "@/features/reporting/components/EmptyState";
import { Users, UserPlus, DollarSign, TrendingUp } from "lucide-react";

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

export default function ReportingCRMPage() {
  const { data, loading, error, refetch } = useCRMReports();

  const growth = data?.growth;
  const retention = data?.retention;
  const ltv = data?.ltv;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">CRM Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Customer acquisition growth, retention rates, lifetime value, segmentation, and credit risk.</p>
        </div>
        <div className="flex items-center gap-2">
          <ReportExportMenu reportName="CRM Analytics" />
          <button onClick={refetch} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={refetch} />}

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ExecutiveKPICard label="Total Customers" icon={<Users className="h-5 w-5" />} value={growth?.totalCustomers?.toLocaleString() ?? "—"} color="sky" />
          <ExecutiveKPICard label="New Customers" icon={<UserPlus className="h-5 w-5" />} value={growth?.newCustomers?.toString() ?? "—"} trend="+22.3%" trendUp color="emerald" />
          <ExecutiveKPICard label="Average LTV" icon={<DollarSign className="h-5 w-5" />} value={ltv?.averageLTV != null ? `$${ltv.averageLTV.toFixed(0)}` : "—"} trend="+$240" trendUp color="violet" />
          <ExecutiveKPICard label="Retention Rate" icon={<TrendingUp className="h-5 w-5" />} value={retention?.retentionRate != null ? `${retention.retentionRate.toFixed(1)}%` : "—"} trend="+1.2pp" trendUp color="amber" />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          <><ChartSkeleton /><ChartSkeleton /></>
        ) : (
          <>
            <CustomerGrowthChart data={growth?.trend ?? []} />
            <CustomerSegmentationChart data={data?.segmentation ?? {}} />
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
              title="Top Customers by LTV"
              headers={["Customer", "Orders", "Revenue", "LTV Score"]}
              rows={data?.ltv?.topCustomers?.slice(0, 10).map(c => [c.customerName ?? "—", c.ordersCount ?? "—", c.totalRevenue != null ? `$${c.totalRevenue.toFixed(2)}` : "—", c.ltvScore != null ? c.ltvScore.toFixed(0) : "—"]) ?? []}
            />
            <DataTable
              title="High Credit Risk Exposure"
              headers={["Customer", "Credit Limit", "Balance", "Utilization %", "Risk Level"]}
              rows={data?.creditRisk?.highRisk?.slice(0, 10).map(c => [c.customerName ?? "—", c.creditLimit != null ? `$${c.creditLimit.toFixed(0)}` : "—", c.currentBalance != null ? `$${c.currentBalance.toFixed(0)}` : "—", c.utilizationPct != null ? `${c.utilizationPct.toFixed(0)}%` : "—", c.riskLevel ?? "—"]) ?? []}
            />
          </>
        )}
      </div>
    </div>
  );
}
