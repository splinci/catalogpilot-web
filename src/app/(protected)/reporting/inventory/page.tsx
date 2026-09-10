"use client";

import { RefreshCw } from "lucide-react";
import { useInventoryReports } from "@/features/reporting/hooks/useInventoryReports";
import { InventorySummaryCard } from "@/features/reporting/components/InventorySummaryCard";
import { InventoryMovementChart } from "@/features/reporting/components/InventoryMovementChart";
import { ReportExportMenu } from "@/features/reporting/components/ReportExportMenu";
import { ChartSkeleton, TableSkeleton, LoadingSkeleton } from "@/features/reporting/components/LoadingSkeleton";
import { ErrorState } from "@/features/reporting/components/EmptyState";

function ProductTable({ title, headers, rows, emptyMsg = "No data." }: {
  title: string; headers: string[]; rows: (string | number)[][]; emptyMsg?: string;
}) {
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
              <tr><td colSpan={headers.length} className="px-4 py-8 text-center text-slate-400 text-sm">{emptyMsg}</td></tr>
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

export default function ReportingInventoryPage() {
  const { data, loading, error, refetch } = useInventoryReports();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inventory Intelligence</h1>
          <p className="text-sm text-slate-500 mt-1">Valuation, movement analysis, turnover, and reorder management.</p>
        </div>
        <div className="flex items-center gap-2">
          <ReportExportMenu reportName="Inventory Intelligence" />
          <button onClick={refetch} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={refetch} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <><LoadingSkeleton className="h-56" /><ChartSkeleton /></>
        ) : (
          <>
            <InventorySummaryCard
              totalValue={data?.valuation?.totalCostValue}
              totalUnits={data?.valuation?.totalUnits}
              skuCount={data?.valuation?.skuCount}
              turnoverRatio={data?.turnover?.turnoverRatio}
              reorderCount={data?.reorderCandidates?.length}
            />
            <InventoryMovementChart data={data?.movement ?? []} />
          </>
        )}
      </div>

      {/* Warehouse Utilization */}
      {!loading && data?.warehouseKPIs && data.warehouseKPIs.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Warehouse Utilization</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {data.warehouseKPIs.map((wh, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{wh.warehouseName}</p>
                  <p className="text-xs text-slate-400">{wh.totalLocations} locations · ${(wh.inventoryValue / 1000).toFixed(1)}K value</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Utilization</span>
                      <span className="font-bold text-slate-900">{wh.utilizationRate?.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${(wh.utilizationRate ?? 0) > 85 ? "bg-rose-400" : "bg-emerald-400"}`} style={{ width: `${wh.utilizationRate ?? 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <TableSkeleton key={i} rows={5} />)
        ) : (
          <>
            <ProductTable title="🔴 Reorder Candidates" headers={["SKU", "Product", "On Hand", "Reorder Pt.", "Suggested Qty"]}
              rows={data?.reorderCandidates?.slice(0, 10).map(p => [p.sku ?? "—", p.productName ?? "—", p.quantityOnHand ?? "—", p.reorderPoint ?? "—", p.suggestedOrderQty ?? "—"]) ?? []}
              emptyMsg="No reorder candidates — all stock levels are healthy." />
            <ProductTable title="🐢 Slow-Moving Products" headers={["SKU", "Product", "On Hand", "Days No Sale", "Value at Risk"]}
              rows={data?.slowMoving?.slice(0, 10).map(p => [p.sku ?? "—", p.productName ?? "—", p.quantityOnHand ?? "—", p.daysSinceLastSale ?? "—", p.valueAtRisk != null ? `$${p.valueAtRisk.toFixed(2)}` : "—"]) ?? []}
              emptyMsg="No slow-moving items detected." />
            <ProductTable title="🚀 Fast-Moving Products" headers={["SKU", "Product", "Units Sold", "Turnover", "Days of Stock"]}
              rows={data?.fastMoving?.slice(0, 10).map(p => [p.sku ?? "—", p.productName ?? "—", p.unitsSold ?? "—", p.turnoverRate?.toFixed(2) ?? "—", p.daysOfStock?.toFixed(0) ?? "—"]) ?? []}
              emptyMsg="No fast-moving data." />
            <ProductTable title="📦 Top Value Products" headers={["SKU", "Product", "On Hand", "Unit Cost", "Total Value"]}
              rows={data?.valuation?.topValueProducts?.slice(0, 10).map(p => [p.sku ?? "—", p.productName ?? "—", p.quantityOnHand ?? "—", p.unitCost != null ? `$${p.unitCost.toFixed(2)}` : "—", p.totalValue != null ? `$${p.totalValue.toFixed(2)}` : "—"]) ?? []}
              emptyMsg="No valuation data." />
          </>
        )}
      </div>
    </div>
  );
}
