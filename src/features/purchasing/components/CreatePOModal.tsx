"use client";

import { useState, useEffect } from "react";
import { SupplierItem } from "../hooks/useSuppliers";
import { CreatePurchaseOrderInput } from "@/types/purchasing.dto";

interface Props {
  isOpen: boolean;
  suppliers: SupplierItem[];
  onClose: () => void;
  onSubmit: (data: CreatePurchaseOrderInput) => Promise<void>;
}

export function CreatePOModal({ isOpen, suppliers = [], onClose, onSubmit }: Props) {
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [products, setProducts] = useState<{ id: string; sku: string; title: string }[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [qty, setQty] = useState(10);
  const [cost, setCost] = useState(15.0);
  const [lines, setLines] = useState<{ productId: string; productTitle: string; orderedQty: number; unitCost: number }[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const json = await res.json();
        const items = Array.isArray(json) ? json : (json.data ?? json.products ?? []);
        setProducts(items.map((p: any) => ({ id: p.id, sku: p.sku || "", title: p.title || p.name || "Product" })));
        if (items.length > 0) setSelectedProductId(items[0].id);
      } catch (err) {
        console.error(err);
      }
    }
    if (isOpen) {
      loadProducts();
      if (safeSuppliers.length > 0) setSelectedSupplierId(safeSuppliers[0].id);
    }
  }, [isOpen, safeSuppliers]);

  if (!isOpen) return null;

  const handleAddLine = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    setLines((prev) => [
      ...prev,
      {
        productId: prod.id,
        productTitle: `${prod.title} (${prod.sku})`,
        orderedQty: qty,
        unitCost: cost,
      },
    ]);
  };

  const handleFormSubmit = async () => {
    setError("");
    if (!selectedSupplierId) {
      setError("Please select a supplier.");
      return;
    }

    let finalLines = [...lines];
    if (finalLines.length === 0 && selectedProductId) {
      const prod = products.find((p) => p.id === selectedProductId);
      if (prod) {
        finalLines.push({
          productId: prod.id,
          productTitle: `${prod.title} (${prod.sku})`,
          orderedQty: qty,
          unitCost: cost,
        });
      }
    }

    if (finalLines.length === 0) {
      setError("At least one line item is required.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        supplierId: selectedSupplierId,
        lines: finalLines.map((l) => ({
          productId: l.productId,
          orderedQty: l.orderedQty,
          unitCost: l.unitCost,
        })),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create purchase order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl space-y-5">
        <h2 className="text-xl font-bold text-slate-900">Create New Purchase Order</h2>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Select Supplier</label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-800"
            >
              <option value="">-- Choose Supplier --</option>
              {safeSuppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Add Line Item</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full rounded-lg border bg-white p-2 text-sm font-semibold text-slate-800"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Quantity</label>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-full rounded-lg border bg-white p-2 text-sm font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Unit Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="w-full rounded-lg border bg-white p-2 text-sm font-semibold text-slate-800"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddLine}
              className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
            >
              + Add Item Line
            </button>
          </div>

          {lines.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-500">Order Lines ({lines.length})</h4>
              <div className="divide-y border rounded-xl overflow-hidden bg-white">
                {lines.map((l, idx) => (
                  <div key={idx} className="flex justify-between p-2.5 text-xs font-semibold text-slate-800">
                    <span>{l.productTitle}</span>
                    <span className="font-bold">{l.orderedQty} units @ ${l.unitCost.toFixed(2)}/ea</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleFormSubmit}
            disabled={submitting}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Creating PO..." : "Create Purchase Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
