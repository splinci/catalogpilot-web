"use client";

import { RefreshCw } from "lucide-react";
import { usePurchasingReports } from "@/features/reporting/hooks/usePurchasingReports";
import { PurchasingSpendChart } from "@/features/reporting/components/PurchasingSpendChart";
import { SupplierPerformanceTable } from "@/features/reporting/components/SupplierPerformanceTable";
import { ReportExportMenu } from "@/features/reporting/components/ReportExportMenu";
import { ChartSkeleton, TableSkeleton, KPICardSkeleton } from "@/features/reporting/components/LoadingSkeleton";
import { ErrorState } from "@/features/reporting/components/EmptyState";
import { ExecutiveKPICard } from "@/features/reporting/components/ExecutiveKPICards";
import { DollarSign, Truck, Clock, CheckCircle } from "lucide-react";

export default function ReportingPurchasingPage() {
  const { data, loading, error, refetch } = usePurchasingReports();

  const spend = data?.spend;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Purchasing Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Supplier scorecards, procurement spend, lead times, and receiving performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <ReportExportMenu reportName="Purchasing Analytics" />
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
          <ExecutiveKPICard label="Total Purchase Spend" icon={<DollarSign className="h-5 w-5" />} value={spend?.totalSpend != null ? `$${(spend.totalSpend / 1000).toFixed(1)}K` : "—"} trend="+5.6%" trendUp={false} color="amber" />
          <ExecutiveKPICard label="Active Suppliers" icon={<Truck className="h-5 w-5" />} value={spend?.activeSuppliers?.toString() ?? "—"} color="indigo" />
          <ExecutiveKPICard label="Avg Lead Time" icon={<Clock className="h-5 w-5" />} value={data?.leadTimes?.avgLeadTimeDays != null ? `${data.leadTimes.avgLeadTimeDays.toFixed(1)} days` : "—"} color="emerald" />
          <ExecutiveKPICard label="On-Time Delivery" icon={<CheckCircle className="h-5 w-5" />} value={data?.receivingPerformance?.onTimeRate != null ? `${data.receivingPerformance.onTimeRate.toFixed(1)}%` : "—"} trend="+1.8pp" trendUp color="emerald" />
        </div>
      )}

      {/* Spend Chart */}
      {loading ? <ChartSkeleton /> : <PurchasingSpendChart data={data?.spendTrend ?? []} />}

      {/* Scorecards */}
      {loading ? <TableSkeleton rows={6} /> : <SupplierPerformanceTable data={data?.supplierScorecards ?? []} />}
    </div>
  );
}
