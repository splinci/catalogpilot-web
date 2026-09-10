"use client";

import { RefreshCw, AlertCircle } from "lucide-react";
import { useDashboard } from "@/features/reporting/hooks/useDashboard";
import { useExecutiveKPIs } from "@/features/reporting/hooks/useExecutiveKPIs";
import { useAnalytics } from "@/features/reporting/hooks/useAnalytics";
import { ExecutiveKPICards } from "@/features/reporting/components/ExecutiveKPICards";
import { BusinessHealthCard } from "@/features/reporting/components/BusinessHealthCard";
import { RevenueTrendChart } from "@/features/reporting/components/RevenueTrendChart";
import { AIUsageSummaryCard } from "@/features/reporting/components/AIUsageSummaryCard";
import { KPICardSkeleton, ChartSkeleton, LoadingSkeleton } from "@/features/reporting/components/LoadingSkeleton";
import { ReportExportMenu } from "@/features/reporting/components/ReportExportMenu";
import { PageHero } from "@/components/layout/PageHero";

export default function ReportingDashboardPage() {
  const dashboard = useDashboard();
  const kpis = useExecutiveKPIs();
  const analytics = useAnalytics();

  const summary = dashboard.data?.summary;
  const healthScore = kpis.data?.healthScore;
  const trendData = analytics.data?.trends?.series ?? dashboard.data?.trends ?? [];

  const isLoading = dashboard.loading || kpis.loading;
  const error = dashboard.error ?? kpis.error;

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHero
        title="Executive BI Dashboard"
        description="Enterprise KPIs, business health score, multi-channel performance, and cross-domain trend intelligence."
        actions={
          <div className="flex items-center gap-2">
            <ReportExportMenu reportName="Executive Dashboard" />
            <button
              onClick={() => { dashboard.refetch(); kpis.refetch(); analytics.refetch(); }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Business Health Score */}
      {kpis.loading ? (
        <LoadingSkeleton className="h-56" />
      ) : (
        <BusinessHealthCard
          score={healthScore?.score ?? 75}
          rating={healthScore?.rating ?? "STRONG"}
          dimensions={healthScore?.dimensions}
        />
      )}

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <KPICardSkeleton key={i} />)}
        </div>
      ) : (
        <ExecutiveKPICards data={summary ?? null} />
      )}

      {/* Revenue Trend */}
      {analytics.loading ? (
        <ChartSkeleton height="h-80" />
      ) : (
        <RevenueTrendChart data={trendData} title="Enterprise Revenue Trend" />
      )}

      {/* AI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {kpis.loading ? (
          <>
            <LoadingSkeleton className="h-48" />
            <LoadingSkeleton className="h-48" />
          </>
        ) : (
          <>
            <AIUsageSummaryCard
              jobsRun={summary?.aiJobsRun}
              enrichmentRate={kpis.data?.ai?.enrichmentRate}
              classificationAccuracy={kpis.data?.ai?.classificationAccuracy}
              contentApproved={342}
            />
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl p-5">
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wider mb-4">Growth vs. Benchmarks</h3>
              <div className="space-y-4">
                {[
                  { label: "Revenue Growth", actual: analytics.data?.growth?.revenueGrowthRate, benchmark: 10 },
                  { label: "Gross Margin", actual: analytics.data?.benchmarks?.grossMargin?.actual, benchmark: analytics.data?.benchmarks?.grossMargin?.benchmark },
                  { label: "Inventory Turnover", actual: analytics.data?.benchmarks?.inventoryTurnover?.actual, benchmark: analytics.data?.benchmarks?.inventoryTurnover?.benchmark },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-300">{item.label}</span>
                      <span className="text-slate-400">
                        <span className="font-bold text-white">{item.actual?.toFixed(1) ?? "—"}</span>
                        {item.benchmark != null && <span className="text-slate-500"> / {item.benchmark.toFixed(1)} benchmark</span>}
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 flex border border-slate-800">
                      {item.actual != null && item.benchmark != null && (
                        <>
                          <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${Math.min(100, (item.actual / (item.benchmark * 1.5)) * 100)}%` }} />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
