"use client";

import { useState, useEffect } from "react";
import { PurchaseOrderAggregate } from "../hooks/usePurchaseOrders";
import { ReceiveGoodsInput } from "@/types/purchasing.dto";

interface Props {
  po: PurchaseOrderAggregate | null;
  onClose: () => void;
  onSubmit: (poId: string, input: ReceiveGoodsInput) => Promise<void>;
}

export function ReceiveGoodsModal({ po, onClose, onSubmit }: Props) {
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [targetWarehouseId, setTargetWarehouseId] = useState("");
  const [receiveQtys, setReceiveQtys] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
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
    if (po) {
      loadWarehouses();
      const initial: Record<string, number> = {};
      po.lines.forEach((line) => {
        initial[line.productId] = line.orderedQty;
      });
      setReceiveQtys(initial);
    }
  }, [po]);

  if (!po) return null;

  const handleConfirm = async () => {
    setError("");
    if (!targetWarehouseId) {
      setError("Please select a target warehouse.");
      return;
    }

    const receivingLines = Object.entries(receiveQtys)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, receivedQty]) => ({
        productId,
        receivedQty,
        warehouseId: targetWarehouseId,
      }));

    if (receivingLines.length === 0) {
      setError("Please enter a positive receiving quantity for at least one item.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(po.id, {
        notes,
        lines: receivingLines,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to process goods receipt.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl space-y-5">
        <h2 className="text-xl font-bold text-slate-900">Receive Goods for {po.poNumber}</h2>
        <p className="text-xs text-slate-500">
          Receiving items will execute an atomic database transaction updating InventoryItem stock and writing InventoryTransaction audit logs.
        </p>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Target Warehouse</label>
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

          <div className="space-y-3">
            {po.lines.map((line) => (
              <div key={line.id} className="flex items-center justify-between border border-slate-200 p-3.5 rounded-xl bg-slate-50">
                <div>
                  <div className="font-bold text-sm text-slate-900">{line.product?.title || line.productId}</div>
                  <div className="text-xs font-medium text-slate-500">
                    Ordered Qty: {line.orderedQty} units @ ${line.unitCost.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600">Receive Qty:</label>
                  <input
                    type="number"
                    min={1}
                    max={line.orderedQty}
                    value={receiveQtys[line.productId] ?? line.orderedQty}
                    onChange={(e) =>
                      setReceiveQtys({
                        ...receiveQtys,
                        [line.productId]: Number(e.target.value),
                      })
                    }
                    className="w-20 rounded-lg border border-slate-200 p-1.5 text-sm text-center font-bold bg-white text-slate-900"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Receiving Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional receiving notes / condition..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-800"
              rows={2}
            />
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
            {submitting ? "Processing..." : "Confirm Goods Received"}
          </button>
        </div>
      </div>
    </div>
  );
}
