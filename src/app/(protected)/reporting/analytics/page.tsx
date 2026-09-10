"use client";

import { RefreshCw } from "lucide-react";
import { useAnalytics } from "@/features/reporting/hooks/useAnalytics";
import { RevenueTrendChart } from "@/features/reporting/components/RevenueTrendChart";
import { BusinessHealthCard } from "@/features/reporting/components/BusinessHealthCard";
import { ReportExportMenu } from "@/features/reporting/components/ReportExportMenu";
import { ExecutiveKPICard } from "@/features/reporting/components/ExecutiveKPICards";
import { KPICardSkeleton, ChartSkeleton, LoadingSkeleton } from "@/features/reporting/components/LoadingSkeleton";
import { ErrorState } from "@/features/reporting/components/EmptyState";
import { TrendingUp, BarChart3, Activity, Target } from "lucide-react";

export default function ReportingAnalyticsPage() {
  const { data, loading, error, refetch } = useAnalytics();

  const growth = data?.growth;
  const health = data?.health;
  const benchmarks = data?.benchmarks;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Advanced Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Growth rates, moving averages, variance analysis, and industry benchmarking.</p>
        </div>
        <div className="flex items-center gap-2">
          <ReportExportMenu reportName="Advanced Analytics" />
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
          <ExecutiveKPICard label="Revenue Growth Rate" icon={<TrendingUp className="h-5 w-5" />} value={growth?.revenueGrowthRate != null ? `${growth.revenueGrowthRate.toFixed(1)}%` : "—"} trend="+2.1pp" trendUp color="indigo" />
          <ExecutiveKPICard label="Order Growth Rate" icon={<BarChart3 className="h-5 w-5" />} value={growth?.orderGrowthRate != null ? `${growth.orderGrowthRate.toFixed(1)}%` : "—"} trend="+1.3pp" trendUp color="emerald" />
          <ExecutiveKPICard label="Customer Growth Rate" icon={<Activity className="h-5 w-5" />} value={growth?.customerGrowthRate != null ? `${growth.customerGrowthRate.toFixed(1)}%` : "—"} trend="+0.8pp" trendUp color="violet" />
          <ExecutiveKPICard label="Health Score" icon={<Target className="h-5 w-5" />} value={health?.overallScore?.toString() ?? "—"} subValue={health?.rating} color="sky" />
        </div>
      )}

      {/* Health Card */}
      {loading ? <LoadingSkeleton className="h-56" /> : <BusinessHealthCard score={health?.overallScore ?? 75} rating={health?.rating ?? "STRONG"} dimensions={health?.dimensions} />}

      {/* Moving Average Chart */}
      {loading ? <ChartSkeleton /> : <RevenueTrendChart data={data?.trends?.series ?? []} title="Revenue Moving Average & Trend Direction" />}

      {/* Benchmarks & Variance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <><LoadingSkeleton className="h-48" /><LoadingSkeleton className="h-48" /></>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Enterprise Industry Benchmarking</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-700">Gross Margin</span>
                  <span className="font-black text-slate-900">{benchmarks?.grossMargin?.actual?.toFixed(1)}% <span className="text-xs font-normal text-slate-400">vs {benchmarks?.grossMargin?.benchmark?.toFixed(1)}% benchmark</span></span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-700">Inventory Turnover</span>
                  <span className="font-black text-slate-900">{benchmarks?.inventoryTurnover?.actual?.toFixed(1)}x <span className="text-xs font-normal text-slate-400">vs {benchmarks?.inventoryTurnover?.benchmark?.toFixed(1)}x benchmark</span></span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-semibold text-slate-700">Days Sales Outstanding (DSO)</span>
                  <span className="font-black text-slate-900">{benchmarks?.dso?.actual?.toFixed(0)} days <span className="text-xs font-normal text-slate-400">vs {benchmarks?.dso?.benchmark?.toFixed(0)} days benchmark</span></span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Revenue Growth & Variance</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-xs py-1 border-b border-slate-50">
                  <span className="text-slate-500">Current Period Revenue</span>
                  <span className="font-bold text-slate-900">${((growth?.currentRevenue ?? 0) / 1000).toFixed(1)}K</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-50">
                  <span className="text-slate-500">Prior Period Revenue</span>
                  <span className="font-bold text-slate-900">${((growth?.priorRevenue ?? 0) / 1000).toFixed(1)}K</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-500">Net Variance</span>
                  <span className={`font-bold ${(growth?.revenueVariance ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {(growth?.revenueVariance ?? 0) >= 0 ? "+" : ""}${((growth?.revenueVariance ?? 0) / 1000).toFixed(1)}K
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
