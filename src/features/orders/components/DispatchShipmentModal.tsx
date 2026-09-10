"use client";

import { useState, useEffect } from "react";
import { SalesOrderAggregate } from "../hooks/useOrders";
import { CreateShipmentInput } from "@/types/order.dto";

interface Props {
  order: SalesOrderAggregate | null;
  onClose: () => void;
  onSubmit: (orderId: string, input: CreateShipmentInput) => Promise<void>;
}

export function DispatchShipmentModal({ order, onClose, onSubmit }: Props) {
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [targetWarehouseId, setTargetWarehouseId] = useState("");
  const [carrier, setCarrier] = useState("FedEx Express");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadWarehouses() {
      try {
        const res = await fetch("/api/wms/warehouses");
        const json = await res.json();
        const items = json.data || [];
        setWarehouses(items.map((w: any) => ({ id: w.id, name: w.name })));
        if (items.length > 0) setTargetWarehouseId(items[0].id);
      } catch (err) {
        console.error(err);
      }
    }
    if (order) {
      loadWarehouses();
      const randomTrack = `TRK-${Math.floor(100000 + Math.random() * 900000)}`;
      setTrackingNumber(randomTrack);
    }
  }, [order]);

  if (!order) return null;

  const handleConfirm = async () => {
    setError("");
    if (!targetWarehouseId || !carrier.trim() || !trackingNumber.trim()) {
      setError("Please specify carrier, tracking number, and source warehouse.");
      return;
    }

    const lines = order.lines.map((l) => ({
      salesOrderLineId: l.id,
      productId: l.productId,
      quantity: l.quantity,
      warehouseId: targetWarehouseId,
    }));

    setSubmitting(true);
    try {
      await onSubmit(order.id, {
        carrier,
        trackingNumber,
        lines,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to dispatch shipment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl space-y-5">
        <h2 className="text-xl font-bold text-slate-900">Dispatch Shipment for {order.orderNumber}</h2>
        <p className="text-xs text-slate-500">
          Dispatching a shipment executes an atomic database transaction deducting InventoryItem stock and writing InventoryTransaction (SALE) audit ledgers.
        </p>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Source Warehouse</label>
            <select
              value={targetWarehouseId}
              onChange={(e) => setTargetWarehouseId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-800"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Carrier</label>
              <input
                type="text"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="e.g. FedEx, UPS, DHL"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tracking Number</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. TRK-99019283"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-500">Shipped Line Items ({order.lines.length})</h4>
            <div className="divide-y border rounded-xl overflow-hidden bg-white">
              {order.lines.map((l) => (
                <div key={l.id} className="flex justify-between p-2.5 text-xs font-semibold text-slate-800">
                  <span>{l.product?.title || l.productId}</span>
                  <span className="font-bold">{l.quantity} units</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Dispatching..." : "Confirm & Dispatch Shipment"}
          </button>
        </div>
      </div>
    </div>
  );
}
