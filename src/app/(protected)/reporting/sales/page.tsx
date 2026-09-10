"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useSalesReports } from "@/features/reporting/hooks/useSalesReports";
import { SalesPerformanceChart } from "@/features/reporting/components/SalesPerformanceChart";
import { RevenueTrendChart } from "@/features/reporting/components/RevenueTrendChart";
import { DateRangeFilter, PRESETS, type DateRange } from "@/features/reporting/components/DateRangeFilter";
import { ReportExportMenu } from "@/features/reporting/components/ReportExportMenu";
import { ExecutiveKPICard } from "@/features/reporting/components/ExecutiveKPICards";
import { KPICardSkeleton, ChartSkeleton, TableSkeleton } from "@/features/reporting/components/LoadingSkeleton";
import { ErrorState } from "@/features/reporting/components/EmptyState";
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";

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

export default function ReportingSalesPage() {
  const [dateRange, setDateRange] = useState<DateRange>(PRESETS[1]); // Last 30 days

  const { data, loading, error, setFilters, refetch } = useSalesReports({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const handleDateChange = (range: DateRange) => {
    setDateRange(range);
    setFilters({ startDate: range.startDate, endDate: range.endDate });
  };

  const summary = data?.summary;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sales Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Revenue performance, order trends, and customer analysis.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DateRangeFilter value={dateRange} onChange={handleDateChange} />
          <ReportExportMenu reportName="Sales Analytics" />
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
          <ExecutiveKPICard label="Total Revenue" icon={<DollarSign className="h-5 w-5" />} value={summary?.totalRevenue != null ? `$${(summary.totalRevenue / 1000).toFixed(1)}K` : "—"} trend="+12.4%" trendUp color="indigo" />
          <ExecutiveKPICard label="Orders" icon={<ShoppingCart className="h-5 w-5" />} value={summary?.ordersCount?.toLocaleString() ?? "—"} trend="+8.9%" trendUp color="violet" />
          <ExecutiveKPICard label="Avg Order Value" icon={<TrendingUp className="h-5 w-5" />} value={summary?.avgOrderValue != null ? `$${summary.avgOrderValue.toFixed(0)}` : "—"} trend="+5.7%" trendUp color="emerald" />
          <ExecutiveKPICard label="Unique Customers" icon={<Users className="h-5 w-5" />} value={summary?.uniqueCustomers?.toLocaleString() ?? "—"} color="sky" />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          <><ChartSkeleton /><ChartSkeleton /></>
        ) : (
          <>
            <SalesPerformanceChart data={data?.revenueTrend ?? []} />
            <RevenueTrendChart data={data?.revenueTrend?.map(t => ({ period: t.period, revenue: t.revenue })) ?? []} title="Revenue by Period" />
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
              title="Top Products by Revenue"
              headers={["Product", "Units Sold", "Revenue", "Margin"]}
              rows={data?.topProducts?.slice(0, 10).map(p => [p.productName ?? "—", p.unitsSold ?? "—", p.revenue != null ? `$${p.revenue.toFixed(2)}` : "—", p.margin != null ? `${p.margin}%` : "—"]) ?? []}
            />
            <DataTable
              title="Top Customers by Spend"
              headers={["Customer", "Orders", "Total Spend", "Avg Order"]}
              rows={data?.topCustomers?.slice(0, 10).map(c => [c.customerName ?? "—", c.ordersCount ?? "—", c.totalSpend != null ? `$${c.totalSpend.toFixed(2)}` : "—", c.avgOrder != null ? `$${c.avgOrder.toFixed(2)}` : "—"]) ?? []}
            />
            <DataTable
              title="Top Categories"
              headers={["Category", "Orders", "Revenue", "% of Total"]}
              rows={data?.topCategories?.slice(0, 8).map(c => [c.categoryName ?? "—", c.ordersCount ?? "—", c.revenue != null ? `$${c.revenue.toFixed(2)}` : "—", c.share != null ? `${c.share.toFixed(1)}%` : "—"]) ?? []}
            />
          </>
        )}
      </div>
    </div>
  );
}
