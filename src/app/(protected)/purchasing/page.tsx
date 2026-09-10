"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { usePurchaseOrders, PurchaseOrderAggregate } from "@/features/purchasing/hooks/usePurchaseOrders";
import { useSuppliers } from "@/features/purchasing/hooks/useSuppliers";
import { useProcurementDashboard } from "@/features/purchasing/hooks/useProcurementDashboard";
import { ProcurementKPIs } from "@/features/purchasing/components/ProcurementKPIs";
import { PurchaseOrderTable } from "@/features/purchasing/components/PurchaseOrderTable";
import { CreatePOModal } from "@/features/purchasing/components/CreatePOModal";
import { ReceiveGoodsModal } from "@/features/purchasing/components/ReceiveGoodsModal";
import { ReceiveGoodsInput } from "@/types/purchasing.dto";

export default function PurchasingPage() {
  const { orders, loading, refetch, createOrder } = usePurchaseOrders();
  const { suppliers } = useSuppliers();
  const { stats, loading: statsLoading } = useProcurementDashboard();

  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderAggregate | null>(null);

  const filteredOrders = orders.filter(
    (po) =>
      po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      po.supplier?.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleReceiveGoodsSubmit = async (poId: string, input: ReceiveGoodsInput) => {
    const res = await fetch(`/api/purchasing/orders/${poId}/receive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Failed to process goods receipt");
    }
    await refetch();
  };

  return (
    <div className="space-y-6">
      <PageHero
        title="Purchase Orders & Procurement"
        description="Issue purchase orders to suppliers, track order lifecycles, and process goods receipts to update inventory automatically."
        actions={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Purchase Order</span>
          </button>
        }
      />

      <ProcurementKPIs stats={stats} loading={statsLoading} />

      <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by PO number or supplier name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border-0 py-2 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <PurchaseOrderTable
          orders={filteredOrders}
          loading={loading}
          onReceive={(po) => setSelectedPO(po)}
        />
      </div>

      <CreatePOModal
        isOpen={isCreateOpen}
        suppliers={suppliers}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={createOrder}
      />

      <ReceiveGoodsModal
        po={selectedPO}
        onClose={() => setSelectedPO(null)}
        onSubmit={handleReceiveGoodsSubmit}
      />
    </div>
  );
}
